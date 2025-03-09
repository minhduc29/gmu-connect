from rest_framework import serializers
from .models import Profile, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name', 'slug']


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    interests = TagSerializer(many=True, required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'bio', 'major', 'graduation_year', 'interests', 'linkedin', 'created_at']
        read_only_fields = ['created_at']

    def update(self, instance, validated_data):
        interests_data = validated_data.pop('interests', None)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update interests if provided
        if interests_data is not None:
            interests = []
            for interest_data in interests_data:
                try:
                    # Only use existing tags, don't create new ones
                    tag = Tag.objects.get(name=interest_data['name'])
                    interests.append(tag)
                except Tag.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Tag '{interest_data['name']}' does not exist. Please select from available tags."
                    )
            instance.interests.set(interests)
        
        instance.save()
        return instance
