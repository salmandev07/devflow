from django.db.models import Q

from rest_framework import serializers

from .models import Task
from teams.models import Team
from projects.models import Project


class TaskSerializer(serializers.ModelSerializer):
    assigned_username = serializers.CharField(
        source="assigned_to.username", read_only=True
    )
    project_name = serializers.CharField(
        source="project.name", read_only=True
    )
    team_name = serializers.CharField(
        source="team.name", read_only=True
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
            "created_by",
            "due_date",
            "estimated_hours",
            "created_at",
        ]
        read_only_fields = ["created_by"]

    def validate_project(self, value):
        user = self.context["request"].user
        if not Project.objects.filter(
            Q(owner=user) | Q(teams__members=user),
            id=value.id,
        ).exists():
            raise serializers.ValidationError(
                "You do not have access to this project"
            )
        return value

    def validate_team(self, value):
        if value is not None:
            user = self.context["request"].user
            project_data = self.initial_data.get("project")
            if project_data:
                try:
                    project = Project.objects.get(id=project_data)
                    # Accept if team is linked via M2M (ProjectTeam) OR via direct FK
                    is_in_project = (
                        project.teams.filter(id=value.id).exists()
                        or value.project_id == project.id
                    )
                    if not is_in_project:
                        raise serializers.ValidationError(
                            "Team is not assigned to this project"
                        )
                except Project.DoesNotExist:
                    pass
            if not Team.objects.filter(
                Q(owner=user) | Q(members=user),
                id=value.id,
            ).exists():
                raise serializers.ValidationError(
                    "You do not have access to this team"
                )
        return value

    def validate_assigned_to(self, value):
        if value is None:
            return value

        user = self.context["request"].user

        if value.is_superuser:
            raise serializers.ValidationError(
                "Superuser accounts cannot be assigned to tasks"
            )

        if not value.is_active:
            raise serializers.ValidationError(
                "Inactive users cannot be assigned to tasks"
            )

        project = self.instance.project if self.instance else self.initial_data.get("project")
        if not project:
            return value

        from projects.models import Project as ProjectModel

        try:
            project_obj = (
                ProjectModel.objects.get(id=project)
                if isinstance(project, int)
                else project
            )
        except ProjectModel.DoesNotExist:
            raise serializers.ValidationError("Project not found")

        # Only project owner can assign tasks
        if project_obj.owner != user:
            raise serializers.ValidationError(
                "Only the project owner can assign tasks"
            )

        team_ids = list(project_obj.teams.values_list("id", flat=True))
        # Also include teams linked via direct FK
        direct_team_ids = list(Team.objects.filter(
            project_id=project_obj.id
        ).values_list("id", flat=True))
        all_team_ids = list(set(team_ids + direct_team_ids))
        if not all_team_ids:
            raise serializers.ValidationError(
                "Cannot assign user: project has no teams assigned"
            )

        is_member = Team.objects.filter(
            Q(id__in=all_team_ids) & Q(members=value)
        ).exists()

        if not is_member:
            raise serializers.ValidationError(
                "Assigned user must be a member of a team assigned to this project"
            )

        return value
