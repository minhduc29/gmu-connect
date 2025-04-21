from django.test import TestCase

# Create your tests here.
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Room


class RoomEdgeCaseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='john', password='testpass')
        self.user2 = User.objects.create_user(username='priya', password='testpass')
        self.user3 = User.objects.create_user(username='karthik', password='testpass')
        self.user4 = User.objects.create_user(username='alice', password='testpass')
        self.client.force_authenticate(user=self.user1)

    def test_group_too_few_members(self):
        url = reverse('room-list-create')
        data = {
            "name": "Mini Group",
            "is_group": True,
            "member_usernames": ["priya"]  # Only 2 members total
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("Group chats require at least 3 members", res.json()['non_field_errors'][0])

    def test_dm_too_many_members(self):
        url = reverse('room-list-create')
        data = {
            "is_group": False,
            "member_usernames": ["priya", "karthik"]
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn("Direct messages must have exactly 2 members", res.json()['non_field_errors'][0])

    def test_non_admin_update_room(self):
        url = reverse('room-list-create')
        data = {
            "name": "Study Group",
            "is_group": True,
            "member_usernames": ["priya", "karthik"]
        }
        created = self.client.post(url, data, format='json')
        room_id = created.data["id"]

        self.client.force_authenticate(user=self.user2)
        res = self.client.put(f"/api/rooms/{room_id}/", {"name": "New Name"}, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.data['message'], "Only admin can make changes to the room")

    def test_remove_below_minimum(self):
        url = reverse('room-list-create')
        data = {
            "name": "Trim Team",
            "is_group": True,
            "member_usernames": ["priya", "karthik"]
        }
        created = self.client.post(url, data, format='json')
        room_id = created.data['id']

        res = self.client.post(
            f"/api/rooms/{room_id}/",
            {"action": "remove", "usernames": ["priya", "karthik"]},
            format="json"
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.data['message'], "Group chat requires at least 3 members.")

    def test_admin_cannot_exit(self):
        url = reverse('room-list-create')
        data = {
            "name": "Core Team",
            "is_group": True,
            "member_usernames": ["priya", "karthik"]
        }
        created = self.client.post(url, data, format='json')
        room_id = created.data['id']

        res = self.client.delete(f"/api/rooms/{room_id}/leave/")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.data['message'], "Admin cannot leave the room.")

    def test_non_admin_exit_success(self):
        url = reverse('room-list-create')
        data = {
            "name": "Exit Test Group",
            "is_group": True,
            "member_usernames": ["priya", "karthik"]
        }
        self.client.post(url, data, format='json')

        room = Room.objects.get(name="Exit Test Group")
        self.client.force_authenticate(user=self.user2)
        res = self.client.delete(f"/api/rooms/{room.id}/leave/")
        self.assertEqual(res.status_code, 204)
