from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'content', 'author__username', 'interest_tags__name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)  # Default ordering like in ViewSet
