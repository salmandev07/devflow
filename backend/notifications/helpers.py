from django.contrib.auth.models import User
from .models import Notification


def create_notification(
    actor,
    user,
    notification_type,
    message,
    url="",
):
    if actor is None or user is None:
        return None
    if actor == user:
        return None

    return Notification.objects.create(
        actor=actor,
        user=user,
        notification_type=notification_type,
        message=message,
        url=url,
    )
