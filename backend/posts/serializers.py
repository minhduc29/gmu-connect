from rest_framework import serializers
from profiles.models import Tag
from profiles.serializers import TagSerializer
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    interest_tags = serializers.SlugRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        slug_field='slug'
    )
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'author_username', 'interest_tags', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Convert interest_tags from list of slugs to list of full tag data
        rep['interest_tags'] = TagSerializer(instance.interest_tags.all(), many=True).data
        return rep
