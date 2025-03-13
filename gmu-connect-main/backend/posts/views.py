from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters
from profiles.views import IsOwnerOrReadOnly
from .models import Post
from .serializers import PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'author__username', 'interest_tags__name', 'interest_tags__slug']
    ordering_fields = ['created_at', 'updated_at', 'title', 'author__username']
    ordering = ['-created_at']

    def get_queryset(self):
        username = self.kwargs.get('username')
        pk = self.kwargs.get('pk')

        # If username is provided, get posts for that user
        if username:
            user = get_object_or_404(User, username=username)
            return Post.objects.filter(author=user)
        
        # If pk is provided, get that specific post
        if pk:
            return Post.objects.filter(pk=pk)
        
        # Default: get posts matching user's interests (including their own)
        user_profile = self.request.user.profile
        return Post.objects.filter(
            interest_tags__in=user_profile.interests.all()
        ).distinct()
