from django.shortcuts import get_object_or_404
from django.db.models import Q, Max
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from users.serializers import UserSerializer
from .consumers import ChatConsumer
from .models import Room, RoomMember, Message
from .serializers import RoomSerializer, MessageSerializer


class RoomListCreateView(generics.ListCreateAPIView):
    """List user's rooms and create new ones (groups require 3+ members, DMs exactly 2)"""
    permission_classes = [IsAuthenticated]
    serializer_class = RoomSerializer

    def get_queryset(self):
        """Get user's rooms with unread status, ordered by latest message"""
        return Room.objects.filter(
            Q(members__user=self.request.user)
        ).prefetch_related(
            'members__user'
        ).annotate(
            latest_message_time=Max('messages__timestamp'),
            user_last_read=Max('members__last_read_timestamp', filter=Q(members__user=self.request.user))
        ).order_by('-latest_message_time')

    def perform_create(self, serializer):
        """Create a new room and notify all members"""
        room = serializer.save()

        # Notify all members about the new room
        for member in room.members.all():
            ChatConsumer.notify(
                group_id=member.user.id,
                event_type='added_to_room',
                event_data={
                    'room_id': room.id,
                    'data': serializer.data
                },
                is_room=False
            )


class RoomView(views.APIView):
    """Handle single room operations (view, update, manage members)"""
    permission_classes = [IsAuthenticated]

    def get_room(self, pk):
        """Get room if user is a member"""
        return get_object_or_404(Room, id=pk, members__user=self.request.user)

    def is_admin(self, room):
        """Check if user is admin of group chat"""
        if not room.is_group:
            return False, "Cannot edit direct message"
        if room.admin != self.request.user:
            return False, "Only admin can make changes to the room"
        return True, None

    def get(self, request, pk):
        """
        Get room details and mark as read.
        Note: For real-time message viewing, WebSocket should also update last_read_timestamp
        when user is actively viewing messages in the room.
        """
        room = self.get_room(pk)

        # Update last read timestamp when user views room
        RoomMember.objects.filter(room=room, user=request.user).update(last_read_timestamp=timezone.now())
        
        serializer = RoomSerializer(room, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        """Update room details (admin only)"""
        room = self.get_room(pk)
        valid, msg = self.is_admin(room)
        if not valid:
            return Response({"message": msg}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RoomSerializer(room, data=request.data, context={'is_update': True}, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Notify all members of the room
            ChatConsumer.notify(
                group_id=pk,
                event_type='room_update',
                event_data={'data': serializer.data},
                is_room=True
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, pk):
        """Add/remove members in group chats (admin only, minimum 3 members)"""
        room = self.get_room(pk)
        valid, msg = self.is_admin(room)
        if not valid:
            return Response({"message": msg}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action')
        usernames = list(set(request.data.get('usernames', [])))
        
        if not action or not usernames:
            return Response({"message": "Both 'action' and 'usernames' fields are required"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        if action not in ['add', 'remove']:
            return Response({"message": "Action must be either 'add' or 'remove'"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Check that all specified users exist
        users = []
        for username in usernames:
            if username == room.admin.username:
                continue
            try:
                user = User.objects.get(username=username)
                users.append(user)
            except User.DoesNotExist:
                return Response({"message": f"User {username} does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        # Check that there are at least 3 members after removing users
        if action == 'remove' and room.members.count() - len(users) < 3:
            return Response({"message": "Group chat requires at least 3 members."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Add/Remove each specified user from/to the room
        for user in users:
            if action == 'add':
                RoomMember.objects.get_or_create(room=room, user=user)
            else:
                RoomMember.objects.filter(room=room, user=user).delete()

        serializer = RoomSerializer(room)

        # Notify all room members about the change
        ChatConsumer.notify(
            group_id=pk,
            event_type='member_added' if action == 'add' else 'member_removed',
            event_data={
                "room_id": pk,
                "data": usernames
            },
            is_room=True
        )

        # Notify all added/removed users
        if action == "add":
            event_type = "added_to_room"
            data = serializer.data
        else:
            event_type = "removed_from_room"
            data = pk

        for user in users:
            ChatConsumer.notify(
                group_id=user.id,
                event_type=event_type,
                event_data={
                    'room_id': pk,
                    'data': data
                },
                is_room=False
            )

        return Response(serializer.data)


class LeaveRoomView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Retrieve the RoomMember instance for the current user and room"""
        room_id = self.kwargs.get('pk')
        return get_object_or_404(RoomMember, room_id=room_id, user=self.request.user)

    def delete(self, request, *args, **kwargs):
        """Allow a non-admin user to leave a room"""
        room_member = self.get_object()
        if not room_member.room.is_group:
            return Response({"message": "Direct messages do not support leaving."}, status=status.HTTP_400_BAD_REQUEST)
        if room_member.room.admin == request.user:
            return Response({"message": "Admin cannot leave the room."}, status=status.HTTP_400_BAD_REQUEST)

        # Get room ID and user data before deleting the membership
        room = room_member.room

        # Delete the membership
        room_member.delete()

        # Notify all room members about the user leaving
        ChatConsumer.notify(
            group_id=room.id,
            event_type='member_removed',
            event_data={
                'room_id': room.id,
                'data': [request.user.username],
                'left': True
            },
            is_room=True
        )

        # Notify the user who left and disconnect them
        ChatConsumer.notify(
            group_id=request.user.id,
            event_type="removed_from_room",
            event_data={
                'room_id': room.id,
                'data': room.id,
                'left': True
            },
            is_room=False
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class MessagePagination(PageNumberPagination):
    """Configures message pagination: 50 per page, max 100"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class MessageListCreateView(generics.ListCreateAPIView):
    """List messages in a room and create new ones"""
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = MessagePagination

    def get_queryset(self):
        """Get room messages and mark as read"""
        room_id = self.kwargs.get('pk')

        # Mark messages as read when getting messages
        RoomMember.objects.filter(room_id=room_id, user=self.request.user).update(last_read_timestamp=timezone.now())

        # Get messages for room, ordered by timestamp
        return Message.objects.filter(room_id=room_id, room__members__user=self.request.user).order_by('-timestamp')

    def perform_create(self, serializer):
        """Create message if user is room member"""
        room_id = self.kwargs.get('pk')

        # Create message
        serializer.save(room_id=room_id, sender=self.request.user)

        # Mark messages as read for sender since they just sent a message
        RoomMember.objects.filter(room_id=room_id, user=self.request.user).update(last_read_timestamp=timezone.now())
