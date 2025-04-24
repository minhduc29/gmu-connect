from django.contrib.auth.models import User
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .serializers import UserSerializer


class UserSerializerTestCase(TestCase):
    """Test cases for UserSerializer"""

    def test_valid_user_serializer(self):
        """Test valid data for user serializer"""
        data = {
            "username": "testuser",
            "email": "testuser@gmu.edu",
            "password": "password123",
            "confirm_password": "password123",
        }
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["email"], "testuser@gmu.edu")

    def test_invalid_email(self):
        """Test invalid email in serializer"""
        data = {
            "username": "testuser",
            "email": "testuser@gmail.com",
            "password": "password123",
            "confirm_password": "password123",
        }
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_password_mismatch(self):
        """Test password mismatch in serializer"""
        data = {
            "username": "testuser",
            "email": "testuser@gmu.edu",
            "password": "password123",
            "confirm_password": "password456",
        }
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)


class RegisterViewTestCase(APITestCase):
    """Test cases for RegisterView"""

    def test_register_user(self):
        """Test user registration"""
        url = reverse("register")  # Correct URL name for registration
        data = {
            "username": "testuser",
            "email": "testuser@gmu.edu",
            "password": "password123",
            "confirm_password": "password123",
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertFalse(User.objects.first().is_active)


class EmailVerificationViewTestCase(APITestCase):
    """Test cases for EmailVerificationView"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@gmu.edu",
            password="password123",
            is_active=False,
        )

    def test_verify_email_success(self):
        """Test successful email verification"""
        from django.contrib.auth.tokens import default_token_generator as token_generator

        token = token_generator.make_token(self.user)
        url = reverse("verify-email", args=[self.user.username, token])  # Correct URL name for email verification
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_verify_email_invalid_token(self):
        """Test email verification with invalid token"""
        url = reverse("verify-email", args=[self.user.username, "invalidtoken"])  # Correct URL name
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_send_verification_email(self):
        """Test sending verification email"""
        url = reverse("send-verification")  # Correct URL name for sending verification email
        data = {"email": self.user.email}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
