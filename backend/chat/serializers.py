from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, RoomMember, Message
from users.serializers import UserSerializer


class RoomMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True)  # For adding members by username
    
    class Meta:
        model = RoomMember
        fields = ['user', 'username', 'last_read_timestamp']
        read_only_fields = ['user', 'last_read_timestamp']
    
    def validate_username(self, value):
        try:
            User.objects.get(username=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError(f"User {value} does not exist")


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['content', 'sender', 'timestamp']
        read_only_fields = ['sender', 'timestamp']


class RoomSerializer(serializers.ModelSerializer):
    members = RoomMemberSerializer(many=True, read_only=True)
    admin = UserSerializer(read_only=True)
    display_name = serializers.SerializerMethodField()
    member_usernames = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=True
    )
    unread = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'name', 'is_group', 'admin', 'members', 'display_name', 'member_usernames', 'unread']

    def create(self, validated_data):
        """Create a new room with the given data and add all members to the room"""
        member_usernames = validated_data.pop('member_usernames', [])

        # Ensure no duplicate DMs are created
        if not validated_data["is_group"]:
            # Get DM room IDs for each user
            dms1 = set(Room.objects.filter(is_group=False, members__user__username=member_usernames[0])
                              .values_list('id', flat=True))
            dms2 = set(Room.objects.filter(is_group=False, members__user__username=member_usernames[1])
                              .values_list('id', flat=True))

            # Find intersection of room IDs
            existing_dm = dms1.intersection(dms2)
            if existing_dm:
                # Return the first common room
                return Room.objects.get(id=existing_dm.pop())

        # Create room and add all members
        room = Room.objects.create(**validated_data)
        for username in member_usernames:
            user = User.objects.get(username=username)
            RoomMember.objects.create(room=room, user=user)
        return room

    def update(self, instance, validated_data):
        """Update only room name"""
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance

    def validate(self, data):
        """Validate the number of members, name, member usernames, and room type"""
        is_update = self.context.get('is_update', False)
        if is_update:
            # Ensure that name is provided when updating
            if not data.get('name'):
                raise serializers.ValidationError("Name is required for group chats")
            return data

        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Authentication required")

        # Get member usernames and ensure it's a list
        member_usernames = set(data.get('member_usernames', []))
        
        # Add owner to members if not already included
        owner_username = request.user.username
        member_usernames.add(owner_username)
        
        # Convert back to list and update data
        data['member_usernames'] = list(member_usernames)

        # Get default for is_group
        data['is_group'] = data.get('is_group', False)
        
        # For group chats, check minimum members requirement
        if data['is_group'] and len(data['member_usernames']) < 3:
            raise serializers.ValidationError(f"Group chats require at least 3 members. Got {len(data['member_usernames'])}")
        # For DMs, ensure exactly 2 members
        elif not data['is_group'] and len(data['member_usernames']) != 2:
            raise serializers.ValidationError(f"Direct messages must have exactly 2 members. Got {len(data['member_usernames'])}")

        # For group chats, name is required
        if data['is_group'] and not data.get('name'):
            raise serializers.ValidationError("Name is required for group chats")

        # Assign admin for group chat
        if data["is_group"]:
            data['admin'] = request.user

        # Validate all usernames exist
        for username in data['member_usernames']:
            if username != owner_username:  # Skip validation for owner since we know they exist
                try:
                    User.objects.get(username=username)
                except User.DoesNotExist:
                    raise serializers.ValidationError(f"User {username} does not exist")

        return data
    
    def get_display_name(self, obj):
        """Get room name or other user's name for DMs"""
        if obj.is_group:
            return obj.name
        
        request = self.context.get('request')
        if request:
            other_member = obj.members.exclude(
                user=request.user
            ).select_related('user').first()
            if other_member:
                return other_member.user.username
        return 'Unknown'

    def get_unread(self, obj):
        """Check if there are any unread messages"""
        user_last_read = getattr(obj, 'user_last_read', None)
        latest_message_time = getattr(obj, 'latest_message_time', None)
        return latest_message_time > user_last_read if user_last_read and latest_message_time else False
