from rest_framework import permissions, generics
from .models import Profile, Tag
from .serializers import ProfileSerializer, TagSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit it"""
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check for either user or author attribute
        return (hasattr(obj, 'user') and obj.user == request.user) or \
               (hasattr(obj, 'author') and obj.author == request.user)


class ProfileView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user profile"""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        # Only show profiles of active users
        return Profile.objects.filter(user__is_active=True)


class TagListView(generics.ListAPIView):
    """View for listing all available tags"""
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
