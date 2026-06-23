from django.db.models.signals import post_save
from django.dispatch import receiver

from comments.models import Comment
from .helpers import create_notification


@receiver(post_save, sender=Comment)
def comment_notification(sender, instance, created, **kwargs):
    if not created:
        return

    task = instance.task

    if not task.assigned_to:
        return

    if task.assigned_to == instance.user:
        return

    create_notification(
        actor=instance.user,
        user=task.assigned_to,
        notification_type="comment_added",
        message=f"{instance.user.username} commented on \"{task.title}\"",
        url=f"/tasks/{task.id}",
    )
