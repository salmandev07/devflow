from rest_framework import serializers

from .models import TimeSession


class TimeSessionSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = TimeSession
        fields = [
            "id",
            "task",
            "user",
            "username",
            "started_at",
            "ended_at",
            "duration_hours",
        ]

        read_only_fields = [
            "id",
            "user",
            "duration_hours",
        ]