from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from teams.models import Team, TeamMembership


class TeamCreateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_create_team(self):
        response = self.client.post(
            "/api/teams/", {"name": "My Team"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "My Team")
        self.assertEqual(response.data["owner"], self.user.id)
        self.assertIn(self.user.id, response.data["members"])

    def test_create_team_missing_name(self):
        response = self.client.post("/api/teams/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_auto_added_as_member(self):
        response = self.client.post(
            "/api/teams/", {"name": "Team"}, format="json"
        )
        team = Team.objects.get(id=response.data["id"])
        self.assertIn(self.user, team.members.all())


class TeamListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username="user1", email="u1@t.com", password="pass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="u2@t.com", password="pass123"
        )
        self.team1 = Team.objects.create(name="Team 1", owner=self.user1)
        self.team1.members.add(self.user1)
        self.team2 = Team.objects.create(name="Team 2", owner=self.user2)
        self.team2.members.add(self.user2)
        refresh = RefreshToken.for_user(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_only_accessible_teams(self):
        response = self.client.get("/api/teams/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        team_ids = [t["id"] for t in results]
        self.assertIn(self.team1.id, team_ids)
        self.assertNotIn(self.team2.id, team_ids)

    def test_list_includes_owned_teams(self):
        response = self.client.get("/api/teams/")
        results = response.data.get("results", response.data)
        names = [t["name"] for t in results]
        self.assertIn("Team 1", names)

    def test_list_includes_member_teams(self):
        self.team2.members.add(self.user1)
        response = self.client.get("/api/teams/")
        results = response.data.get("results", response.data)
        names = [t["name"] for t in results]
        self.assertIn("Team 2", names)


class TeamUpdateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.team = Team.objects.create(name="Old Name", owner=self.user)
        self.team.members.add(self.user)
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_update_team_name(self):
        response = self.client.patch(
            f"/api/teams/{self.team.id}/",
            {"name": "New Name"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.team.refresh_from_db()
        self.assertEqual(self.team.name, "New Name")


class TeamDeleteTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.team = Team.objects.create(name="To Delete", owner=self.user)
        self.team.members.add(self.user)
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_delete_team(self):
        response = self.client.delete(f"/api/teams/{self.team.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Team.objects.filter(id=self.team.id).exists())


class TeamMembershipTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.member = User.objects.create_user(
            username="member", email="m@t.com", password="pass123"
        )
        self.team = Team.objects.create(name="Team", owner=self.owner)
        self.team.members.add(self.owner)
        refresh = RefreshToken.for_user(self.owner)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_add_member(self):
        response = self.client.post(
            f"/api/teams/{self.team.id}/members/",
            {"team": self.team.id, "user": self.member.id, "role": "developer"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TeamMembership.objects.filter(
                team=self.team, user=self.member
            ).exists()
        )
        self.assertIn(self.member, self.team.members.all())

    def test_list_members(self):
        TeamMembership.objects.create(
            team=self.team, user=self.member, role="developer"
        )
        response = self.client.get(f"/api/teams/{self.team.id}/members/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        usernames = [m["username"] for m in results]
        self.assertIn("member", usernames)

    def test_update_member_role(self):
        membership = TeamMembership.objects.create(
            team=self.team, user=self.member, role="developer"
        )
        response = self.client.patch(
            f"/api/teams/memberships/{membership.id}/",
            {"role": "lead"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        membership.refresh_from_db()
        self.assertEqual(membership.role, "lead")

    def test_remove_member(self):
        membership = TeamMembership.objects.create(
            team=self.team, user=self.member, role="developer"
        )
        self.team.members.add(self.member)
        response = self.client.delete(
            f"/api/teams/memberships/{membership.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertNotIn(self.member, self.team.members.all())

    def test_duplicate_member_prevented(self):
        TeamMembership.objects.create(
            team=self.team, user=self.member, role="developer"
        )
        response = self.client.post(
            f"/api/teams/{self.team.id}/members/",
            {"team": self.team.id, "user": self.member.id, "role": "lead"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TeamTransferOwnershipTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", email="o@t.com", password="pass123"
        )
        self.new_owner = User.objects.create_user(
            username="newowner", email="no@t.com", password="pass123"
        )
        self.team = Team.objects.create(name="Team", owner=self.owner)
        self.team.members.add(self.owner, self.new_owner)
        refresh = RefreshToken.for_user(self.owner)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_transfer_ownership(self):
        response = self.client.post(
            f"/api/teams/{self.team.id}/transfer-ownership/",
            {"new_owner_id": self.new_owner.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.team.refresh_from_db()
        self.assertEqual(self.team.owner, self.new_owner)

    def test_transfer_to_non_member_fails(self):
        stranger = User.objects.create_user(
            username="stranger", email="s@t.com", password="pass123"
        )
        response = self.client.post(
            f"/api/teams/{self.team.id}/transfer-ownership/",
            {"new_owner_id": stranger.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_transfer_without_new_owner_id(self):
        response = self.client.post(
            f"/api/teams/{self.team.id}/transfer-ownership/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_owner_cannot_transfer(self):
        refresh = RefreshToken.for_user(self.new_owner)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.post(
            f"/api/teams/{self.team.id}/transfer-ownership/",
            {"new_owner_id": self.owner.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
