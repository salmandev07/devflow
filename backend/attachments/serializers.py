from rest_framework import serializers

from .models import TaskAttachment


class TaskAttachmentSerializer(
    serializers.ModelSerializer
):
    uploaded_by_username = serializers.CharField(
        source="uploaded_by.username",
        read_only=True
    )

    class Meta:
        model = TaskAttachment
        fields = [
            "id",
            "task",
            "uploaded_by",
            "uploaded_by_username",
            "file",
            "uploaded_at",
        ]
        read_only_fields = [
            "uploaded_by",
        ]