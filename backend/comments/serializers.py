from rest_framework import serializers

from .models import Comment


class CommentSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "user",
            "username",
            "content",
            "created_at",
        ]
        read_only_fields = [
            "user",
            "task",
        ]