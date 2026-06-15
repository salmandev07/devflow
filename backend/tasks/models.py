from django.db import models
from django.contrib.auth.models import User

from projects.models import Project
from teams.models import Team


class Task(models.Model):
    STATUS_CHOICES = [
        ("todo", "Todo"),
        ("progress", "In Progress"),
        ("done", "Done"),
    ]

    title = models.CharField(max_length=255)

    description = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="todo"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="tasks",
        null=True,
        blank=True
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title