import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser, User
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt.exceptions import InvalidTokenError


@database_sync_to_async
def get_user(token_key):
    """Authenticate user from JWT token and return the user object"""
    try:
        # Attempt to decode the token
        UntypedToken(token_key)
        
        # If successful, decode the token to get the user ID
        decoded_data = jwt.decode(token_key, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get('user_id')
        
        # Get the user from the database
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, InvalidTokenError, User.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """Custom middleware that authenticates WebSocket connections using JWT tokens"""
    async def __call__(self, scope, receive, send):
        # Get the token from the query string
        query_string = scope.get('query_string', b'').decode()
        query_params = dict(param.split('=') for param in query_string.split('&') if param)
        
        token = query_params.get('token', None)
        
        # If no token in query string, check headers
        if not token:
            headers = dict(scope.get('headers', []))
            if b'authorization' in headers:
                auth_header = headers[b'authorization'].decode()
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
        
        # Set the user on the scope
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Convenience function to wrap Django Channels' AuthMiddlewareStack with JWT authentication"""
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
