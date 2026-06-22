from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from teams.models import Team
from projects.models import Project, ProjectTeam
from tasks.models import Task
from comments.models import Comment
from notifications.models import Notification


class UnauthorizedAccessTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_tasks_unauthorized(self):
        endpoints = [
            "/api/tasks/",
            "/api/teams/",
            "/api/projects/",
            "/api/notifications/",
            "/api/users/list/",
            "/api/activities/",
        ]
        for endpoint in endpoints:
            response = self.client.get(endpoint)
            self.assertEqual(
                response.status_code,
                status.HTTP_401_UNAUTHORIZED,
                f"{endpoint} should require auth",
            )


class CrossUserAccessTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@t.com", password="pass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@t.com", password="pass123"
        )
        self.team1 = Team.objects.create(name="Team1", owner=self.user1)
        self.team1.members.add(self.user1)
        self.project1 = Project.objects.create(
            name="Project1", owner=self.user1
        )
        self.task1 = Task.objects.create(
            title="Task1", project=self.project1
        )
        refresh = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_cannot_view_other_user_task(self):
        response = self.client.get(f"/api/tasks/{self.task1.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_other_user_task(self):
        response = self.client.patch(
            f"/api/tasks/{self.task1.id}/",
            {"title": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_delete_other_user_task(self):
        response = self.client.delete(f"/api/tasks/{self.task1.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_view_other_user_project(self):
        response = self.client.get(f"/api/projects/{self.project1.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_view_other_user_team(self):
        response = self.client.get(f"/api/teams/{self.team1.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TeamOwnershipRestrictionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.member = User.objects.create_user(
            username="member", email="m@t.com", password="pass123"
        )
        self.team = Team.objects.create(name="Team", owner=self.owner)
        self.team.members.add(self.owner, self.member)
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_member_cannot_transfer_ownership(self):
        response = self.client.post(
            f"/api/teams/{self.team.id}/transfer-ownership/",
            {"new_owner_id": self.member.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_cannot_access_team(self):
        outsider = User.objects.create_user(
            username="outsider", email="x@t.com", password="pass123"
        )
        refresh = RefreshToken.for_user(outsider)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.get(f"/api/teams/{self.team.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProjectAccessRestrictionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.outsider = User.objects.create_user(
            username="outsider", email="s@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="Private", owner=self.owner
        )
        refresh = RefreshToken.for_user(self.outsider)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_outsider_cannot_create_task_in_project(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "T", "project": self.project.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CommentAccessTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@t.com", password="pass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="P", owner=self.user1
        )
        self.task = Task.objects.create(
            title="T", project=self.project
        )
        self.comment = Comment.objects.create(
            task=self.task, user=self.user1, content="Hello"
        )
        refresh = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_outsider_cannot_delete_comment(self):
        response = self.client.delete(
            f"/api/comments/{self.comment.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_cannot_list_comments(self):
        response = self.client.get(
            f"/api/comments/tasks/{self.task.id}/comments/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 0)


class NotificationAccessTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@t.com", password="pass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@t.com", password="pass123"
        )
        self.notif = Notification.objects.create(
            user=self.user1, message="Private"
        )
        refresh = RefreshToken.for_user(self.user2)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_cannot_view_other_notifications(self):
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        notif_ids = [n["id"] for n in results]
        self.assertNotIn(self.notif.id, notif_ids)

    def test_cannot_update_other_notification(self):
        response = self.client.patch(
            f"/api/notifications/{self.notif.id}/",
            {"is_read": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
