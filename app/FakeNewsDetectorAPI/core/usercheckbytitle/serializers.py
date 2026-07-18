from rest_framework import serializers

class UserCheckSerializer(serializers.Serializer):
    """Serializes the headline/article text entered by a user."""
    user_news = serializers.CharField(required=False, allow_blank=True)
    content = serializers.CharField(required=False, allow_blank=True)
    url = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        fields = ['user_news', 'content', 'url']