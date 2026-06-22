from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from teams.models import Team
from projects.models import Project, ProjectTeam
from tasks.models import Task, TimeSession


class TaskCreateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.team = Team.objects.create(name="Team", owner=self.user)
        self.team.members.add(self.user)
        self.project = Project.objects.create(
            name="Project", owner=self.user
        )
        ProjectTeam.objects.create(project=self.project, team=self.team)
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_create_task(self):
        response = self.client.post(
            "/api/tasks/",
            {
                "title": "Test Task",
                "description": "A task",
                "project": self.project.id,
                "team": self.team.id,
                "priority": "high",
                "estimated_hours": 5,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Test Task")
        self.assertEqual(response.data["project"], self.project.id)

    def test_create_task_missing_title(self):
        response = self.client.post(
            "/api/tasks/",
            {"project": self.project.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_invalid_project(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "T", "project": 99999},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TaskListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@t.com", password="pass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@t.com", password="pass123"
        )
        self.project1 = Project.objects.create(
            name="P1", owner=self.user1
        )
        self.project2 = Project.objects.create(
            name="P2", owner=self.user2
        )
        self.task1 = Task.objects.create(
            title="Task 1", project=self.user1.projects.first() or self.project1
        )
        self.task2 = Task.objects.create(title="Task 2", project=self.project2)
        refresh = RefreshToken.for_user(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_only_accessible_tasks(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        task_ids = [t["id"] for t in results]
        self.assertIn(self.task1.id, task_ids)
        self.assertNotIn(self.task2.id, task_ids)


class TaskUpdateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="Project", owner=self.user
        )
        self.task = Task.objects.create(
            title="Old Title", project=self.project
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_update_task_title(self):
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"title": "New Title"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, "New Title")

    def test_update_task_status(self):
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"status": "progress"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "progress")

    def test_update_task_priority(self):
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"priority": "low"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.priority, "low")


class TaskDeleteTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="Project", owner=self.user
        )
        self.task = Task.objects.create(
            title="To Delete", project=self.project
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_delete_task(self):
        response = self.client.delete(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())


class TaskAssignmentTest(TestCase):
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
        self.project = Project.objects.create(
            name="Project", owner=self.owner
        )
        ProjectTeam.objects.create(project=self.project, team=self.team)
        self.task = Task.objects.create(
            title="Task", project=self.project
        )
        refresh = RefreshToken.for_user(self.owner)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_assign_user_to_task(self):
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"assigned_to": self.member.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.assigned_to, self.member)

    def test_assign_superuser_fails(self):
        superuser = User.objects.create_superuser(
            username="admin", email="a@t.com", password="pass123"
        )
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"assigned_to": superuser.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unassign_user(self):
        self.task.assigned_to = self.member
        self.task.save()
        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {"assigned_to": None},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertIsNone(self.task.assigned_to)


class TaskTimerTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="Project", owner=self.user
        )
        self.task = Task.objects.create(
            title="Task", project=self.project
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_start_timer(self):
        response = self.client.post(
            f"/api/tasks/{self.task.id}/start-timer/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TimeSession.objects.filter(
                task=self.task, user=self.user, ended_at__isnull=True
            ).exists()
        )

    def test_start_timer_already_running(self):
        self.client.post(
            f"/api/tasks/{self.task.id}/start-timer/", format="json"
        )
        response = self.client.post(
            f"/api/tasks/{self.task.id}/start-timer/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_stop_timer(self):
        self.client.post(
            f"/api/tasks/{self.task.id}/start-timer/", format="json"
        )
        response = self.client.post(
            f"/api/tasks/{self.task.id}/stop-timer/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("hours_added", response.data)

    def test_stop_timer_no_active(self):
        response = self.client.post(
            f"/api/tasks/{self.task.id}/stop-timer/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_timer_status(self):
        response = self.client.get(
            f"/api/tasks/{self.task.id}/timer-status/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["running"])

    def test_timer_status_running(self):
        self.client.post(
            f"/api/tasks/{self.task.id}/start-timer/", format="json"
        )
        response = self.client.get(
            f"/api/tasks/{self.task.id}/timer-status/", format="json"
        )
        self.assertTrue(response.data["running"])

    def test_list_sessions(self):
        self.client.post(
            f"/api/tasks/{self.task.id}/start-timer/", format="json"
        )
        self.client.post(
            f"/api/tasks/{self.task.id}/stop-timer/", format="json"
        )
        response = self.client.get(
            f"/api/tasks/{self.task.id}/sessions/", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
