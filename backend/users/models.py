from django.contrib.auth.models import AbstractUser
from django.db import models


class Tag(models.Model):
    """Tags for users and posts matching"""
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        """String representation of a tag"""
        return self.name

    # tags = models.ManyToManyField(Tag, related_name="users", blank=True)


class CustomUser(AbstractUser):
    """Custom user model for custom fields"""
    email = models.EmailField(blank=False)
