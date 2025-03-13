from django.contrib.auth.tokens import default_token_generator as token_generator
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail
from rest_framework import permissions, status
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer


class RegisterView(CreateAPIView):
    """View for user registration"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class EmailVerificationView(APIView):
    """View for email verification"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, username, token):
        """Verify and activate user account"""
        # Get the user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"message": "No user found with this username."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the token
        if token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully!"})
        else:
            return Response({"message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        """Send verification email upon request of user"""
        email = request.data.get("email")
        if not email:
            return Response({"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the user through email and check if user is active
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"message": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)

            # Generate token and URL
            token = token_generator.make_token(user)
            domain = get_current_site(request).domain
            url = f"http://{domain}/api/auth/verify/{user.username}/{token}"

            # Send the email
            msg = f"Hi {user.username}, \n\nPlease follow this link to verify your email address: {url}"
            send_mail("Email Verification", msg, "services.gmuconnect@gmail.com", [user.email])

            return Response({"message": "Verification email sent successfully!"})
        except User.DoesNotExist:
            return Response({"message": "No user found with this email."}, status=status.HTTP_400_BAD_REQUEST)
