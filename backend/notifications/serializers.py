from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(
        source="actor.username",
        read_only=True,
        default=None,
    )
    type_display = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "actor",
            "actor_username",
            "notification_type",
            "type_display",
            "message",
            "url",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "actor",
            "notification_type",
            "message",
            "url",
            "created_at",
        ]
