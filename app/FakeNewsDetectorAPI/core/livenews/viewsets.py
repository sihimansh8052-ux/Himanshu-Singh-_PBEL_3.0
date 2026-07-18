from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
import requests
from django.utils import timezone
from datetime import timedelta

from .models import LiveNews
from .serializers import LiveNewsDetailedSerializer
from core.ai_engine import analyze_news_content

SAMPLE_FALLBACK_NEWS = [
    {
        "title": "Global Climate Summit Reaches Historic Agreement on Clean Energy Transition",
        "category": "environment",
        "section_id": "environment",
        "section_name": "Environment",
        "img_url": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/climate-summit-historic-agreement"
    },
    {
        "title": "SHOCKING SECRET! Scientists Discover 100% Miracle Cure Doctors Tried to Hide!",
        "category": "lifestyle",
        "section_id": "lifeandstyle",
        "section_name": "Life and Style",
        "img_url": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/shocking-secret-miracle-cure-clickbait"
    },
    {
        "title": "Tech Giant Announces Breakthrough Quantum Processor Operating at Room Temperature",
        "category": "technology",
        "section_id": "technology",
        "section_name": "Technology",
        "img_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/tech-quantum-processor-breakthrough"
    },
    {
        "title": "LEAKED CONSPIRACY: Secret Government Satellite Beam Mind Control Revealed!",
        "category": "news",
        "section_id": "news",
        "section_name": "News",
        "img_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/leaked-conspiracy-satellite-fake"
    },
    {
        "title": "World Cup Final Sets Record Global Viewership Benchmark Across Digital Platforms",
        "category": "sport",
        "section_id": "sport",
        "section_name": "Sport",
        "img_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/world-cup-record-viewership"
    },
    {
        "title": "Central Bank Adjusts Interest Rates Following Inflation Data Release",
        "category": "business",
        "section_id": "business",
        "section_name": "Business",
        "img_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/central-bank-interest-rates"
    },
    {
        "title": "NASA James Webb Space Telescope Discovers Atmospheric Water Vapor on Exoplanet",
        "category": "news",
        "section_id": "news",
        "section_name": "News",
        "img_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/nasa-jwst-exoplanet-discovery"
    },
    {
        "title": "UNBELIEVABLE VIRAL HOAX: Aliens Landed in Local Park and Banned Cell Phones!",
        "category": "news",
        "section_id": "news",
        "section_name": "News",
        "img_url": "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/unbelievable-viral-hoax-aliens"
    },
    {
        "title": "International Film Festival Winners Announced in Gala Ceremony",
        "category": "arts",
        "section_id": "artanddesign",
        "section_name": "Art and Design",
        "img_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/film-festival-winners-announcement"
    },
    {
        "title": "New Public Transit Infrastructure Expansion Project Commences Construction",
        "category": "uknews",
        "section_id": "uk-news",
        "section_name": "UK News",
        "img_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/public-transit-expansion-commences"
    },
    {
        "title": "Renewable Solar Infrastructure Surpasses Target Milestones Ahead of Schedule",
        "category": "environment",
        "section_id": "environment",
        "section_name": "Environment",
        "img_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/solar-infrastructure-milestones"
    },
    {
        "title": "SHOCKING BANNED TRUTH: Drinking Salt Water Reverses Aging Instantly!",
        "category": "lifestyle",
        "section_id": "lifeandstyle",
        "section_name": "Life and Style",
        "img_url": "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80",
        "web_url": "https://example.com/shocking-banned-truth-aging-hoax"
    }
]

def ensure_live_news_data():
    """Attempts Guardian API fetch; populates database with rich fallback news if API fails or items < 10."""
    try:
        resp = requests.get("https://content.guardianapis.com/search?api-key=4116712e-6099-4447-840d-f3506427a606", timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if "response" in data and "results" in data["response"]:
                for idx, article in enumerate(data["response"]["results"]):
                    web_url = article.get("webUrl", f"https://guardian.com/{idx}")
                    if not LiveNews.objects.filter(web_url=web_url).exists():
                        title = article.get("webTitle", "Guardian Article")
                        analysis = analyze_news_content(title=title)
                        LiveNews.objects.create(
                            title=title,
                            publication_date=article.get("webPublicationDate", timezone.now().isoformat()),
                            news_category=article.get("sectionId", "news"),
                            prediction=analysis["prediction"],
                            section_id=article.get("sectionId", "news"),
                            section_name=article.get("sectionName", "News"),
                            type=article.get("type", "article"),
                            web_url=web_url,
                            img_url="None"
                        )
    except Exception as e:
        print("Guardian API unavailable, using fallback dataset:", e)

    # Ensure fallback dataset is populated if db records are insufficient
    if LiveNews.objects.count() < 10:
        now = timezone.now()
        for idx, item in enumerate(SAMPLE_FALLBACK_NEWS):
            if not LiveNews.objects.filter(web_url=item["web_url"]).exists():
                analysis = analyze_news_content(title=item["title"])
                LiveNews.objects.create(
                    title=item["title"],
                    publication_date=now - timedelta(hours=idx * 2),
                    news_category=item["category"],
                    prediction=analysis["prediction"],
                    section_id=item["section_id"],
                    section_name=item["section_name"],
                    type="article",
                    web_url=item["web_url"],
                    img_url=item["img_url"]
                )

class LiveNewsPrediction(viewsets.ViewSet):
    http_method_names = ('get',)

    def list(self, request):
        """Displays all recent retrieved news items with AI metrics."""
        ensure_live_news_data()
        all_news = LiveNews.objects.all().order_by('-id')[:12]
        
        # Enrich serializer output with AI details
        serialized = LiveNewsDetailedSerializer(all_news, many=True).data
        enriched = []
        for item in serialized:
            analysis = analyze_news_content(title=item.get("title", ""))
            item["confidence_score"] = analysis["confidence_score"]
            item["real_probability"] = analysis["real_probability"]
            item["fake_probability"] = analysis["fake_probability"]
            item["sensationalism_score"] = analysis["sensationalism_score"]
            item["flagged_keywords"] = analysis["flagged_keywords"]
            item["summary"] = analysis["summary"]
            enriched.append(item)

        return Response(enriched, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        try:
            news = LiveNews.objects.get(pk=pk)
        except LiveNews.DoesNotExist:
            return Response({"error": "News not found"}, status=404)
        
        serialized = LiveNewsDetailedSerializer(news).data
        analysis = analyze_news_content(title=serialized.get("title", ""))
        serialized.update(analysis)
        return Response(serialized, status=status.HTTP_200_OK)

class LiveNewsByCategory(viewsets.ViewSet):
    def list(self, request, category=None):
        if not category:
            return Response({'error': 'Category not provided'}, status=400)
            
        ensure_live_news_data()
        category_clean = category.strip().lower()
        live_news = LiveNews.objects.filter(news_category__iexact=category_clean).order_by('-id')[:12]
        
        # If no news in specific category, search across section_id or title
        if not live_news.exists():
            live_news = LiveNews.objects.filter(section_id__icontains=category_clean).order_by('-id')[:12]
        if not live_news.exists():
            live_news = LiveNews.objects.all().order_by('-id')[:12]

        serialized = LiveNewsDetailedSerializer(live_news, many=True).data
        enriched = []
        for item in serialized:
            analysis = analyze_news_content(title=item.get("title", ""))
            item["confidence_score"] = analysis["confidence_score"]
            item["real_probability"] = analysis["real_probability"]
            item["fake_probability"] = analysis["fake_probability"]
            item["sensationalism_score"] = analysis["sensationalism_score"]
            item["flagged_keywords"] = analysis["flagged_keywords"]
            item["summary"] = analysis["summary"]
            enriched.append(item)

        return Response(enriched, status=status.HTTP_200_OK)