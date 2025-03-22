import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Message, RoomMember
from users.serializers import UserSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling all chat-related notifications for a specific user.
    This includes:
    - New messages in any room the user is a member of
    - Room membership changes (added/removed)
    - Room updates (name changes)
    - Room creation/deletion
    """
    
    async def connect(self):
        """Handle WebSocket connection - authenticate user and join user-specific group"""
        self.user = self.scope['user']

        # Check if user is authenticated
        if self.user.is_anonymous:
            await self.close(code=4001)  # Unauthorized
            return

        # Create a user-specific group name (for dms)
        self.user_group_name = f'user_chat_{self.user.id}'
        
        # Join user-specific group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        # Also join all room groups the user is a member of
        room_ids = await self.get_user_room_ids()
        for room_id in room_ids:
            room_group_name = f'chat_{room_id}'
            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )
            
        await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection - leave all groups"""
        if hasattr(self, 'user') and not self.user.is_anonymous:
            # Leave user-specific group
            if hasattr(self, 'user_group_name'):
                await self.channel_layer.group_discard(
                    self.user_group_name,
                    self.channel_name
                )
            
            # Leave all room groups
            room_ids = await self.get_user_room_ids()
            for room_id in room_ids:
                room_group_name = f'chat_{room_id}'
                await self.channel_layer.group_discard(
                    room_group_name,
                    self.channel_name
                )

    async def receive(self, text_data):
        """Process incoming WebSocket messages"""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        room_id = text_data_json.get('room_id')

        if room_id:
            if message_type == 'message':
                # Handle new chat message
                message_content = text_data_json.get('content')
                if message_content:
                    # Check if user is a member of the room
                    is_member = await self.is_room_member(room_id)
                    if not is_member:
                        return

                    # Save message to database
                    db_message = await self.save_message(room_id, message_content)

                    # Get serialized sender data
                    sender_data = await self.get_user_data()

                    # Send message to room group
                    room_group_name = f'chat_{room_id}'
                    await self.channel_layer.group_send(
                        room_group_name,
                        {
                            'type': 'chat_message',
                            'room_id': room_id,
                            'content': message_content,
                            'sender': sender_data,
                            'timestamp': db_message.timestamp.isoformat(),
                        }
                    )

                    # Update last read timestamp
                    await self.update_last_read(room_id)

            elif message_type == 'mark_read':
                # Mark messages as read in a specific room
                await self.update_last_read(room_id)

            elif message_type == 'join_room':
                # Join a new room group (when user navigates to a room)
                room_group_name = f'chat_{room_id}'
                await self.channel_layer.group_add(
                    room_group_name,
                    self.channel_name
                )
                # Mark messages as read when joining a room
                await self.update_last_read(room_id)

    # Event handlers for different types of notifications
    # Event handlers send notification to the (WebSocket) clients
    # receive() handles incoming messages from the clients
    # General flow: Client -> Producer (Consumer)/Publisher (receive) -> Group (Redis broadcasts) -> Consumer/Subscriber (event handlers) -> Client
    
    async def chat_message(self, event):
        """Send chat message to WebSocket client"""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'room_id': event['room_id'],
            'content': event['content'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))
    
    async def room_update(self, event):
        """Send room update notification (name change)"""
        await self.send(text_data=json.dumps({
            'type': 'room_update',
            'room': event['data']
        }))
    
    async def added_to_room(self, event):
        """Send notification when user is added to a room"""
        # Join the new room group
        room_group_name = f'chat_{event["room_id"]}'
        await self.channel_layer.group_add(
            room_group_name,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'added_to_room',
            'data': event['data']
        }))
    
    async def removed_from_room(self, event):
        """Send notification when user is removed from a room"""
        # Leave the room group
        room_group_name = f'chat_{event["room_id"]}'
        await self.channel_layer.group_discard(
            room_group_name,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'removed_from_room',
            'data': event['data'], # Room id
            'left': event.get('left', False)
        }))
    
    async def member_added(self, event):
        """Send notification when a new member is added to a room"""
        await self.send(text_data=json.dumps({
            'type': 'member_added',
            'room_id': event['room_id'],
            'data': event['data'] # List of usernames added
        }))
    
    async def member_removed(self, event):
        """Send notification when a member is removed from a room"""
        await self.send(text_data=json.dumps({
            'type': 'member_removed',
            'room_id': event['room_id'],
            'data': event['data'], # List of usernames removed
            'left': event.get('left', False) # For distinguishing between leaving and being kicked
        }))
    
    # Database helper methods
    
    @database_sync_to_async
    def get_user_room_ids(self):
        """Get IDs of all rooms the user is a member of"""
        return list(RoomMember.objects.filter(
            user=self.user
        ).values_list('room_id', flat=True))
    
    @database_sync_to_async
    def is_room_member(self, room_id):
        """Check if the user is a member of the room"""
        return RoomMember.objects.filter(
            room_id=room_id,
            user=self.user
        ).exists()
    
    @database_sync_to_async
    def save_message(self, room_id, message_content):
        """Save a new message to the database and return the created message object"""
        return Message.objects.create(
            room_id=room_id,
            sender=self.user,
            content=message_content
        )
    
    @database_sync_to_async
    def update_last_read(self, room_id):
        """Update the last read timestamp for the current user in this room"""
        RoomMember.objects.filter(
            room_id=room_id,
            user=self.user
        ).update(last_read_timestamp=timezone.now())
    
    @database_sync_to_async
    def get_user_data(self):
        """Get serialized user data for including in messages"""
        serializer = UserSerializer(self.user)
        return serializer.data

    @classmethod
    def notify(cls, group_id, event_type, event_data, is_room):
        """
        Initiate a WebSocket message to the channel layer, which will be broadcast by Redis and trigger an event handler.
        It is essentially the receive() function but from the server instead of a client.
        This static method can be called from views or other parts of the application.

        Parameters:
            group_id (int): The ID of the user/room to notify
            event_type (str): The type of event to send
            event_data (dict): The data to include in the event
            is_room (bool): Whether the ID refers to a user or a room
        """
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        group_name = f'chat_{group_id}' if is_room else f'user_chat_{group_id}'

        # Add the type key to the event data
        event_data['type'] = event_type

        # Send to the user's/room group
        async_to_sync(channel_layer.group_send)(
            group_name,
            event_data
        )