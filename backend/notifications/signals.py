from django.db.models.signals import post_save
from django.dispatch import receiver

from comments.models import Comment

from .models import Notification


@receiver(post_save, sender=Comment)
def comment_notification(
    sender,
    instance,
    created,
    **kwargs
):
    if not created:
        return

    task = instance.task

    if not task.assigned_to:
        return

    if task.assigned_to == instance.user:
        return

    Notification.objects.create(
        user=task.assigned_to,
        message=(
            f"{instance.user.username} "
            f"commented on "
            f"{task.title}"
        )
    )