from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify


class Tag(models.Model):
    """Model for storing tags that can be associated with profiles"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        # Always slugify the slug field to ensure proper format
        self.slug = slugify(self.slug)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.slug


class Profile(models.Model):
    """Extended profile model for additional user information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    major = models.CharField(max_length=100, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    interests = models.ManyToManyField(Tag, related_name='profiles', blank=True)
    linkedin = models.URLField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a Profile instance when a new User is created"""
    if created:
        Profile.objects.create(user=instance)
