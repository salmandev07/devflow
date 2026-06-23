from rest_framework import serializers
from .models import Team


class TeamSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="project.name", read_only=True, default=None
    )

    class Meta:
        model = Team
        fields = "__all__"
        read_only_fields = ["owner"]
        extra_kwargs = {
            "members": {
                "required": False
            }
        }