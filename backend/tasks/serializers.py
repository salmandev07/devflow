from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    team_name = serializers.CharField(
        source="team.name",
        read_only=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "project",
            "project_name",
            "team",
            "team_name",
            "assigned_to",
            "assigned_username",
            "due_date",
            "created_at",
        ]