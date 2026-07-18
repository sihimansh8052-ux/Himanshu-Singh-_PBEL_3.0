from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
import random

from .models import NewsQuizData
from .serializers import NewsQuizSerializer, NewsQuizAnsweredSerializer
from core.ai_engine import analyze_news_content

QUIZ_FALLBACK_DATA = [
    {
        "title": "NASA Launches Artemis II Mission Planning for Lunar Orbit",
        "description": "Engineers at Kennedy Space Center complete preliminary countdown simulations for manned lunar flight test.",
        "label": True,
        "explanation": "Authentic news report sourced from official NASA press announcements."
    },
    {
        "title": "SHOCKING SECRET: Scientists Confirm Drinking Lemon Juice Cures All Viral Infections!",
        "description": "A hidden study suppressed by major pharmaceutical corporations proves lemon juice is 100% effective against every virus.",
        "label": False,
        "explanation": "Flagged as fake news due to medical clickbait language, unverified claims, and conspiracy tropes."
    },
    {
        "title": "European Central Bank Maintains Key Benchmark Interest Rates Unchanged",
        "description": "Policymakers cite stabilizing inflation metrics across eurozone economies following quarterly monetary review.",
        "label": True,
        "explanation": "Standard financial reporting matching verified Central Bank press releases."
    },
    {
        "title": "BANNED VIDEO PROOF: Secret Alien Spaceship Lands at Midnight in Downtown City Park!",
        "description": "Leaked smartphone footage shows mysterious glowing green saucer landing before authorities deleted all online posts.",
        "label": False,
        "explanation": "Classic viral hoax with sensationalist buzzwords, clickbait title, and lack of credible evidence."
    },
    {
        "title": "Global Renewable Energy Capacity Grows by Record 50% in Previous Year",
        "description": "International Energy Agency report highlights massive acceleration in solar photovoltaic and wind energy installations globally.",
        "label": True,
        "explanation": "Verified environmental statistics published by the International Energy Agency (IEA)."
    }
]

def ensure_quiz_data():
    if NewsQuizData.objects.count() == 0:
        for q in QUIZ_FALLBACK_DATA:
            NewsQuizData.objects.create(
                news_title=q["title"],
                news_description=q["description"],
                label=q["label"]
            )

class NewsQuizViewSet(viewsets.ViewSet):
    """Handles random quiz question retrieval and answer validation with AI rationale."""
    http_method_names = ('get', 'post')
    serializer_class = NewsQuizAnsweredSerializer

    def list(self, request):
        ensure_quiz_data()
        news_for_quiz = NewsQuizData.objects.get_random_news()
        
        if not news_for_quiz:
            # Fallback direct sample if database query returns None
            sample = random.choice(QUIZ_FALLBACK_DATA)
            return Response({
                'id': 999,
                'news_title': sample['title'],
                'news_description': sample['description'],
                'label': sample['label']
            }, status=status.HTTP_200_OK)

        serializer = NewsQuizSerializer(news_for_quiz)
        data = serializer.data
        analysis = analyze_news_content(title=data.get('news_title', ''), content=data.get('news_description', ''))
        data['ai_real_probability'] = analysis['real_probability']
        data['ai_fake_probability'] = analysis['fake_probability']
        return Response(data, status=status.HTTP_200_OK)

    def create(self, request):
        serializer = NewsQuizAnsweredSerializer(data=request.data)
        if serializer.is_valid():
            news_id = serializer.validated_data['id']
            user_answer = serializer.validated_data['answer']
            
            real_item = NewsQuizData.objects.get_label_of_news(news_id)
            if real_item:
                real_label = bool(real_item.label)
                title = real_item.news_title
                desc = real_item.news_description
            else:
                real_label = True
                title = "Sample News Item"
                desc = ""

            is_correct = (real_label == user_answer)
            analysis = analyze_news_content(title=title, content=desc)

            return Response({
                'result': is_correct,
                'correct_answer': real_label,
                'verdict_text': "Real News" if real_label else "Fake News",
                'explanation': analysis['summary'],
                'ai_confidence': analysis['confidence_score']
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)