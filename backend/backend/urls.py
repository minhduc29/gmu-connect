"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from chat.views import RoomListCreateView, RoomView, LeaveRoomView, MessageListCreateView
from profiles.views import ProfileView, TagListView
from users.views import RegisterView, EmailVerificationView
from posts.views import PostViewSet


router = DefaultRouter()
# Register the username-based lookup first (more specific pattern)
router.register(r'posts/by/(?P<username>[^/.]+)', PostViewSet, basename='user-posts')
# Default routes for posts (including pk-based lookup)
router.register(r'posts', PostViewSet, basename='posts')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name="get-token"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name="refresh-token"),
    path('api/auth/register/', RegisterView.as_view(), name="register"),
    path('api/auth/verify/', EmailVerificationView.as_view(), name="send-verification"),
    path('api/auth/verify/<str:username>/<str:token>/', EmailVerificationView.as_view(), name="verify-email"),
    path('api/profiles/<str:username>/', ProfileView.as_view(), name="profile"),
    path('api/tags/', TagListView.as_view(), name="tags"),
    path('api/', include(router.urls)), # Posts
    path('api/rooms/', RoomListCreateView.as_view(), name='rooms'),
    path('api/rooms/<int:pk>/', RoomView.as_view(), name='room'),
    path('api/rooms/<int:pk>/leave/', LeaveRoomView.as_view(), name='leave-room'),
    path('api/rooms/<int:pk>/messages/', MessageListCreateView.as_view(), name='messages'),
]
