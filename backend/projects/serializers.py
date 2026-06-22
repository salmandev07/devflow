from rest_framework import serializers
from .models import Project, ProjectTeam


class ProjectTeamSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="team.name", read_only=True)

    class Meta:
        model = ProjectTeam
        fields = ["id", "team", "team_name", "assigned_at"]


class ProjectSerializer(serializers.ModelSerializer):
    assigned_teams = ProjectTeamSerializer(
        source="project_teams",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "created_at",
            "assigned_teams",
        ]
        read_only_fields = ["owner"]
