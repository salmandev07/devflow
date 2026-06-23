from django.db.models import Q

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from .models import Team, TeamMembership
from .serializers import TeamSerializer
from .team_membership_serializers import TeamMembershipSerializer
from notifications.helpers import create_notification


def _get_project_owner(team):
    """Return the project owner if team belongs to a project, else None."""
    if team.project_id:
        return team.project.owner
    return None


class TeamListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get("project_id")
        if project_id:
            return Team.objects.filter(
                project_id=project_id,
            ).filter(
                Q(project__owner=self.request.user)
                | Q(members=self.request.user)
            ).distinct().order_by("-created_at")
        return Team.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        project_id = self.request.query_params.get("project_id")
        if project_id:
            from projects.models import Project
            project = Project.objects.filter(
                Q(owner=self.request.user) | Q(teams__members=self.request.user),
                id=project_id,
            ).first()
            if not project:
                raise PermissionDenied("Project not found or access denied.")
            if project.owner != self.request.user:
                raise PermissionDenied("Only the project owner can create teams.")
            team = serializer.save(owner=project.owner, project=project)
        else:
            team = serializer.save(owner=self.request.user)
        team.members.add(team.owner)
        TeamMembership.objects.get_or_create(
            team=team,
            user=team.owner,
            defaults={"role": "lead"},
        )
        from activities.models import Activity
        Activity.objects.create(
            user=self.request.user,
            action="create",
            team=team,
            project=team.project,
            message=f"Created team '{team.name}'",
        )


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_update(self, serializer):
        team = serializer.instance
        project_owner = _get_project_owner(team)
        if project_owner:
            if self.request.user != project_owner:
                raise PermissionDenied("Only the project owner can edit this team.")
        elif team.owner != self.request.user:
            raise PermissionDenied("Only the team owner can edit this team.")
        serializer.save()

    def perform_destroy(self, instance):
        project_owner = _get_project_owner(instance)
        if project_owner:
            if self.request.user != project_owner:
                raise PermissionDenied("Only the project owner can delete this team.")
        elif instance.owner != self.request.user:
            raise PermissionDenied("Only the team owner can delete this team.")
        instance.delete()


class TeamMembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        team_id = self.kwargs["team_id"]
        return TeamMembership.objects.select_related("user").filter(
            team_id=team_id,
            team__in=Team.objects.filter(
                Q(owner=self.request.user) | Q(members=self.request.user)
            ),
        ).order_by("-id")

    def perform_create(self, serializer):
        team = Team.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).filter(id=self.kwargs["team_id"]).first()
        if not team:
            raise PermissionDenied("Team not found or access denied.")
        project_owner = _get_project_owner(team)
        if project_owner:
            if self.request.user != project_owner:
                raise PermissionDenied("Only the project owner can add members.")
        elif team.owner != self.request.user:
            raise PermissionDenied("Only the team owner can add members.")
        user = serializer.validated_data.get("user")
        if user == team.owner:
            raise PermissionDenied("The team owner is already a member.")
        membership = serializer.save(team=team)
        membership.team.members.add(membership.user)
        create_notification(
            actor=self.request.user,
            user=membership.user,
            notification_type="team_member_added",
            message=f"{self.request.user.username} added you to team \"{team.name}\"",
            url=f"/teams/{team.id}",
        )


class TeamMembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamMembership.objects.select_related("user").filter(
            team__in=Team.objects.filter(
                Q(owner=self.request.user) | Q(members=self.request.user)
            ),
        ).order_by("-id")

    def perform_update(self, serializer):
        team = serializer.instance.team
        project_owner = _get_project_owner(team)
        if project_owner:
            if self.request.user != project_owner:
                raise PermissionDenied("Only the project owner can change member roles.")
        elif team.owner != self.request.user:
            raise PermissionDenied("Only the team owner can change member roles.")
        serializer.save()

    def perform_destroy(self, instance):
        team = instance.team
        project_owner = _get_project_owner(team)
        if project_owner:
            if self.request.user != project_owner:
                raise PermissionDenied("Only the project owner can remove members.")
        elif team.owner != self.request.user:
            raise PermissionDenied("Only the team owner can remove members.")
        if instance.user == team.owner:
            raise PermissionDenied("Team owner cannot be removed.")
        removed_user = instance.user
        instance.team.members.remove(removed_user)
        instance.delete()
        if removed_user != self.request.user:
            create_notification(
                actor=self.request.user,
                user=removed_user,
                notification_type="team_member_removed",
                message=f"{self.request.user.username} removed you from team \"{team.name}\"",
                url=f"/teams/{team.id}",
            )


class TeamTransferOwnershipView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            team = Team.objects.get(pk=pk, owner=request.user)
        except Team.DoesNotExist:
            return Response(
                {"detail": "Team not found or you are not the owner"},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_owner_id = request.data.get("new_owner_id")
        if not new_owner_id:
            return Response(
                {"detail": "new_owner_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not team.members.filter(id=new_owner_id).exists():
            return Response(
                {"detail": "New owner must be a current team member"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        team.owner_id = new_owner_id
        team.save()

        serializer = TeamSerializer(team)
        return Response(serializer.data)
