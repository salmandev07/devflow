from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from teams.models import Team
from projects.models import Project, ProjectTeam
from tasks.models import Task
from notifications.models import Notification


class TeamAPICRUDTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_crud_full_cycle(self):
        response = self.client.post(
            "/api/teams/", {"name": "CRUD Team"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        team_id = response.data["id"]

        response = self.client.get(f"/api/teams/{team_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "CRUD Team")

        response = self.client.patch(
            f"/api/teams/{team_id}/",
            {"name": "Updated Team"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.delete(f"/api/teams/{team_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(f"/api/teams/{team_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProjectAPICRUDTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_crud_full_cycle(self):
        response = self.client.post(
            "/api/projects/",
            {"name": "CRUD Project", "description": "test"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data["id"]

        response = self.client.get(f"/api/projects/{project_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.patch(
            f"/api/projects/{project_id}/",
            {"name": "Updated Project"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.delete(f"/api/projects/{project_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(f"/api/projects/{project_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TaskAPICRUDTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="P", owner=self.user
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_crud_full_cycle(self):
        response = self.client.post(
            "/api/tasks/",
            {
                "title": "CRUD Task",
                "project": self.project.id,
                "priority": "medium",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task_id = response.data["id"]

        response = self.client.get(f"/api/tasks/{task_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.patch(
            f"/api/tasks/{task_id}/",
            {"title": "Updated Task", "status": "progress"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.delete(f"/api/tasks/{task_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(f"/api/tasks/{task_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class NotificationAPICRUDTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_notifications(self):
        Notification.objects.create(
            user=self.user, message="Notif 1"
        )
        Notification.objects.create(
            user=self.user, message="Notif 2"
        )
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 2)

    def test_update_notification(self):
        notif = Notification.objects.create(
            user=self.user, message="Read me"
        )
        response = self.client.patch(
            f"/api/notifications/{notif.id}/",
            {"is_read": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_delete_notification(self):
        notif = Notification.objects.create(
            user=self.user, message="Delete me"
        )
        response = self.client.delete(
            f"/api/notifications/{notif.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Notification.objects.filter(id=notif.id).exists()
        )


class PaginationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="P", owner=self.user
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_tasks_paginated(self):
        for i in range(60):
            Task.objects.create(
                title=f"Task {i}", project=self.project
            )
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 60)
        self.assertEqual(len(response.data["results"]), 50)

    def test_teams_paginated(self):
        for i in range(5):
            t = Team.objects.create(name=f"Team {i}", owner=self.user)
            t.members.add(self.user)
        response = self.client.get("/api/teams/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)

    def test_projects_paginated(self):
        for i in range(3):
            Project.objects.create(name=f"P{i}", owner=self.user)
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)


class SubtaskAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="P", owner=self.user
        )
        self.task = Task.objects.create(
            title="T", project=self.project
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_create_subtask(self):
        response = self.client.post(
            f"/api/subtasks/tasks/{self.task.id}/subtasks/",
            {"title": "Sub 1"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_subtasks(self):
        self.client.post(
            f"/api/subtasks/tasks/{self.task.id}/subtasks/",
            {"title": "Sub 1"},
            format="json",
        )
        response = self.client.get(
            f"/api/subtasks/tasks/{self.task.id}/subtasks/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CommentAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user", email="u@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="P", owner=self.user
        )
        self.task = Task.objects.create(
            title="T", project=self.project
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_create_comment(self):
        response = self.client.post(
            f"/api/comments/tasks/{self.task.id}/comments/",
            {"task": self.task.id, "content": "Nice work!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_comments(self):
        self.client.post(
            f"/api/comments/tasks/{self.task.id}/comments/",
            {"task": self.task.id, "content": "Comment"},
            format="json",
        )
        response = self.client.get(
            f"/api/comments/tasks/{self.task.id}/comments/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
