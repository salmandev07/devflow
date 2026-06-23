from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    TYPE_CHOICES = [
        ("task_assigned", "Task Assigned"),
        ("task_unassigned", "Task Unassigned"),
        ("task_status_changed", "Task Status Changed"),
        ("task_completed", "Task Completed"),
        ("comment_added", "Comment Added"),
        ("mention", "Mention"),
        ("attachment_added", "Attachment Added"),
        ("team_member_added", "Team Member Added"),
        ("team_member_removed", "Team Member Removed"),
        ("project_created", "Project Created"),
        ("subtask_completed", "Subtask Completed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="triggered_notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
        default="comment_added",
    )

    message = models.TextField()

    url = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.message[:50]}"
