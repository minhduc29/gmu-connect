from rest_framework import serializers
from .models import CustomUser, Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tag model"""
    class Meta:
        model = Tag
        fields = ["name"]

    # tags = TagSerializer(many=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""
    confirm_password = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "confirm_password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """Create an instance of user and deactivate it until user verify their email"""
        user = CustomUser.objects.create_user(**validated_data)
        user.is_active = False
        user.save()
        return user

    def validate_email(self, data):
        """Ensure unique GMU email address"""
        email = data.lower()
        if not email.endswith("@gmu.edu"):
            raise serializers.ValidationError("You must use a GMU email address.")
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate(self, data):
        """Ensure password matches confirm password"""
        if data["password"] != data.pop("confirm_password"):
            raise serializers.ValidationError("Passwords do not match.")
        return data
