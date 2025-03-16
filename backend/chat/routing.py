from django.urls import re_path
from .consumers import ChatConsumer

# Define WebSocket URL patterns for chat functionality
websocket_urlpatterns = [
    # Route for user-specific WebSocket connections
    # This single connection handles all chat notifications for a user
    # Example URL: ws://example.com/ws/chat/
    re_path(r'ws/chat/$', ChatConsumer.as_asgi()),
] 