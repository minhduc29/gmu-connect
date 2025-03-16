"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from chat.routing import websocket_urlpatterns
from .jwt_auth_middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    # HTTP requests are handled by Django's ASGI application
    "http": get_asgi_application(),

    # WebSocket requests are handled by Channels with JWT authentication
    "websocket": AllowedHostsOriginValidator(
        # Apply JWT authentication for WebSocket connections
        JWTAuthMiddlewareStack(
            # Route WebSocket connections to appropriate consumers
            URLRouter(websocket_urlpatterns)
        )
    ),
})
