from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, ProjectTeam
from .serializers import ProjectSerializer
from teams.models import Team


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.prefetch_related("teams").filter(
            Q(owner=self.request.user)
            | Q(teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.prefetch_related("teams").filter(
            Q(owner=self.request.user)
            | Q(teams__members=self.request.user)
        ).distinct().order_by("-created_at")


class ProjectAssignTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(
            Project, id=project_id, owner=request.user
        )
        team_id = request.data.get("team_id")
        if not team_id:
            return Response(
                {"detail": "team_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        team = get_object_or_404(Team, id=team_id, owner=request.user)
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
            Project, id=project_id, owner=request.user
        )
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
