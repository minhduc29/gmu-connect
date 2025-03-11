from rest_framework import serializers
from .models import Profile, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name', 'slug']


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    interests = serializers.SlugRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        slug_field='slug',
        required=False
    )

    class Meta:
        model = Profile
        fields = ['username', 'email', 'bio', 'major', 'graduation_year', 'interests', 'linkedin', 'created_at']
        read_only_fields = ['created_at']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Convert interests from list of slugs to list of full tag data
        rep['interests'] = TagSerializer(instance.interests.all(), many=True).data
        return rep
