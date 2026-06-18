from rest_framework import serializers

from .models import TeamMembership


class TeamMembershipSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = TeamMembership
        fields = [
            "id",
            "team",
            "user",
            "username",
            "role",
        ]