from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from teams.models import Team
from projects.models import Project, ProjectTeam


class ProjectCreateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_create_project(self):
        response = self.client.post(
            "/api/projects/",
            {"name": "My Project", "description": "A test project"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "My Project")
        self.assertEqual(response.data["owner"], self.user.id)

    def test_create_project_missing_name(self):
        response = self.client.post(
            "/api/projects/", {"description": "No name"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProjectListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@t.com", password="pass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@t.com", password="pass123"
        )
        self.project1 = Project.objects.create(
            name="Project 1", owner=self.user1
        )
        self.project2 = Project.objects.create(
            name="Project 2", owner=self.user2
        )
        refresh = RefreshToken.for_user(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_only_accessible_projects(self):
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        project_ids = [p["id"] for p in results]
        self.assertIn(self.project1.id, project_ids)
        self.assertNotIn(self.project2.id, project_ids)

    def test_list_includes_team_projects(self):
        team = Team.objects.create(name="Team", owner=self.user2)
        team.members.add(self.user1)
        ProjectTeam.objects.create(project=self.project2, team=team)
        response = self.client.get("/api/projects/")
        results = response.data.get("results", response.data)
        project_ids = [p["id"] for p in results]
        self.assertIn(self.project2.id, project_ids)


class ProjectUpdateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="Old Name", owner=self.user
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_update_project(self):
        response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {"name": "New Name"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.name, "New Name")


class ProjectDeleteTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="To Delete", owner=self.user
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_delete_project(self):
        response = self.client.delete(f"/api/projects/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())


class ProjectTeamAssignmentTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.project = Project.objects.create(
            name="Project", owner=self.user
        )
        self.team = Team.objects.create(name="Team", owner=self.user)
        self.team.members.add(self.user)
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_assign_team(self):
        response = self.client.post(
            f"/api/projects/{self.project.id}/assign-team/",
            {"team_id": self.team.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            ProjectTeam.objects.filter(
                project=self.project, team=self.team
            ).exists()
        )

    def test_unassign_team(self):
        ProjectTeam.objects.create(project=self.project, team=self.team)
        response = self.client.post(
            f"/api/projects/{self.project.id}/unassign-team/",
            {"team_id": self.team.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            ProjectTeam.objects.filter(
                project=self.project, team=self.team
            ).exists()
        )

    def test_duplicate_assign_fails(self):
        ProjectTeam.objects.create(project=self.project, team=self.team)
        response = self.client.post(
            f"/api/projects/{self.project.id}/assign-team/",
            {"team_id": self.team.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_assign_missing_team_id(self):
        response = self.client.post(
            f"/api/projects/{self.project.id}/assign-team/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unassign_nonexistent_team(self):
        response = self.client.post(
            f"/api/projects/{self.project.id}/unassign-team/",
            {"team_id": 99999},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProjectPermissionTest(TestCase):
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

    def test_outsider_cannot_view_project(self):
        response = self.client.get(f"/api/projects/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_cannot_update_project(self):
        response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {"name": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_cannot_delete_project(self):
        response = self.client.delete(f"/api/projects/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_cannot_assign_team(self):
        team = Team.objects.create(name="T", owner=self.owner)
        response = self.client.post(
            f"/api/projects/{self.project.id}/assign-team/",
            {"team_id": team.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
