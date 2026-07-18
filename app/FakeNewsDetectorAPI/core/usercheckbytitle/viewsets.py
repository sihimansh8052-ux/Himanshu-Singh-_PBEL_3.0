from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .serializers import UserCheckSerializer
from core.ai_engine import analyze_news_content, extract_article_from_url

class UserCheckViewSet(viewsets.ViewSet):
    """Viewset to handle AI detection for titles, articles, and URLs."""
    http_method_names = ('get', 'post')
    serializer_class = UserCheckSerializer

    def create(self, request):
        """
        Gets news headline or full text from user and returns comprehensive AI analysis.
        """
        serializer = UserCheckSerializer(data=request.data)
        if serializer.is_valid():
            title = serializer.validated_data.get('user_news', '')
            content = serializer.validated_data.get('content', '')
            url = serializer.validated_data.get('url', '')

            # If a URL is passed directly into the create view
            if url and not title and not content:
                article_data, error = extract_article_from_url(url)
                if error:
                    return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
                title = article_data.get('title', '')
                content = article_data.get('content', '')

            analysis = analyze_news_content(title=title, content=content)

            # Response includes backward-compatible 'prediction' plus deep AI signals
            response_data = {
                'prediction': analysis['prediction'],
                'verdict': analysis['verdict'],
                'confidence_score': analysis['confidence_score'],
                'real_probability': analysis['real_probability'],
                'fake_probability': analysis['fake_probability'],
                'sensationalism_score': analysis['sensationalism_score'],
                'flagged_keywords': analysis['flagged_keywords'],
                'summary': analysis['summary'],
                'title_analyzed': title
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='url')
    def analyze_url(self, request):
        """
        Extracts article text from a URL and runs AI analysis.
        """
        url = request.data.get('url', '').strip()
        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        article_data, error = extract_article_from_url(url)
        if error:
            return Response({'error': f'Could not scrape URL: {error}'}, status=status.HTTP_400_BAD_REQUEST)

        analysis = analyze_news_content(title=article_data['title'], content=article_data['content'])

        response_data = {
            'url': url,
            'title': article_data['title'],
            'content_snippet': article_data['content'][:300] + '...' if len(article_data['content']) > 300 else article_data['content'],
            'prediction': analysis['prediction'],
            'verdict': analysis['verdict'],
            'confidence_score': analysis['confidence_score'],
            'real_probability': analysis['real_probability'],
            'fake_probability': analysis['fake_probability'],
            'sensationalism_score': analysis['sensationalism_score'],
            'flagged_keywords': analysis['flagged_keywords'],
            'summary': analysis['summary']
        }
        return Response(response_data, status=status.HTTP_200_OK)
