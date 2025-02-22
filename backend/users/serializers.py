from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""
    confirm_password = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """Create an instance of user and deactivate it until user verify their email"""
        return User.objects.create_user(is_active=False, **validated_data)

    def validate_email(self, data):
        """Ensure unique GMU email address"""
        email = data.lower()
        if not email or not email.endswith("@gmu.edu"):
            raise serializers.ValidationError("You must enter a GMU email address.")
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate(self, data):
        """Ensure password matches confirm password"""
        if data["password"] != data.pop("confirm_password"):
            raise serializers.ValidationError("Passwords do not match.")
        return data
