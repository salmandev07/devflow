from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, ProjectTeam
from .serializers import ProjectSerializer
from teams.models import Team, TeamMembership
from teams.serializers import TeamSerializer
from notifications.helpers import create_notification


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.prefetch_related("teams").filter(
            Q(owner=self.request.user)
            | Q(teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        from activities.models import Activity
        Activity.objects.create(
            user=self.request.user,
            action="create",
            project=project,
            message=f"Created project '{project.name}'",
        )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.prefetch_related("teams").filter(
            Q(owner=self.request.user)
            | Q(teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner can edit this project.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner can delete this project.")
        instance.delete()


class ProjectTeamListView(generics.ListAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        return Team.objects.filter(
            project_id=project_id,
        ).filter(
            Q(project__owner=self.request.user)
            | Q(members=self.request.user)
        ).distinct().order_by("-created_at")


class ProjectTeamCreateView(generics.CreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        project = get_object_or_404(
            Project.objects.filter(
                Q(owner=self.request.user)
                | Q(teams__members=self.request.user)
            ).distinct(),
            id=self.kwargs["project_id"],
        )
        if project.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner can create teams.")
        team = serializer.save(owner=project.owner, project=project)
        team.members.add(team.owner)
        TeamMembership.objects.get_or_create(
            team=team,
            user=team.owner,
            defaults={"role": "lead"},
        )
        # Also create M2M link for backward compat with existing queries
        ProjectTeam.objects.get_or_create(project=project, team=team)
        from activities.models import Activity
        Activity.objects.create(
            user=self.request.user,
            action="create",
            team=team,
            project=project,
            message=f"Created team '{team.name}' in project '{project.name}'",
        )


class ProjectAssignTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(
            Project.objects.filter(
                Q(owner=request.user)
                | Q(teams__members=request.user)
            ).distinct(),
            id=project_id,
        )
        if project.owner != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner can assign teams.")
        team_id = request.data.get("team_id")
        if not team_id:
            return Response(
                {"detail": "team_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        team = get_object_or_404(
            Team.objects.filter(
                Q(owner=request.user) | Q(members=request.user)
            ).distinct(),
            id=team_id,
        )
        if ProjectTeam.objects.filter(project=project, team=team).exists():
            return Response(
                {"detail": "Team already assigned to this project"},
                status=status.HTTP_409_CONFLICT,
            )
        ProjectTeam.objects.create(project=project, team=team)
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectUnassignTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(
            Project.objects.filter(
                Q(owner=request.user)
                | Q(teams__members=request.user)
            ).distinct(),
            id=project_id,
        )
        if project.owner != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner can remove teams.")
        team_id = request.data.get("team_id")
        if not team_id:
            return Response(
                {"detail": "team_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        deleted, _ = ProjectTeam.objects.filter(
            project=project, team_id=team_id
        ).delete()
        if deleted == 0:
            return Response(
                {"detail": "Team is not assigned to this project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ProjectSerializer(project)
        return Response(serializer.data)


class ProjectReportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(
            Project.objects.filter(
                Q(owner=request.user)
                | Q(teams__members=request.user)
            ).distinct(),
            id=project_id,
        )
        from tasks.models import Task
        tasks = Task.objects.filter(project=project)
        total = tasks.count()
        completed = tasks.filter(status="done").count()
        in_progress = tasks.filter(status="progress").count()
        todo = tasks.filter(status="todo").count()

        from django.db.models import Sum
        hours = tasks.aggregate(
            estimated=Sum("estimated_hours"),
        )

        return Response({
            "project": project.name,
            "total_tasks": total,
            "completed": completed,
            "in_progress": in_progress,
            "todo": todo,
            "estimated_hours": float(hours["estimated"] or 0),
        })
