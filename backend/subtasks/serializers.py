from rest_framework import serializers

from .models import Subtask


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = [
            "id",
            "task",
            "title",
            "completed",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "task",
            "created_at",
        ]