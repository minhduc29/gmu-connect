from django.db import models
from django.contrib.auth.models import User


class Room(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)  # Null for DMs
    is_group = models.BooleanField(default=False)
    admin = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='admin_rooms')  # Only for group chats


class RoomMember(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    last_read_timestamp = models.DateTimeField(null=True, blank=True)  # When the user last read messages in this room
    
    class Meta:
        unique_together = ['room', 'user']


class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)  # The user who sent the message
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['room', 'timestamp']),  # For loading messages in a room by time
        ]
