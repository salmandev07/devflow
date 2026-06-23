from django.db import models
from django.contrib.auth.models import User

from projects.models import Project
from teams.models import Team
from django.utils import timezone


class Task(models.Model):
    STATUS_CHOICES = [
        ("todo", "Todo"),
        ("progress", "In Progress"),
        ("done", "Done"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
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

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
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

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks"
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )

    estimated_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    actual_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    
    def __str__(self):
        return self.title
    
class TimeSession(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="time_sessions"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    started_at = models.DateTimeField(
        default=timezone.now
    )

    ended_at = models.DateTimeField(
        null=True,
        blank=True
    )

    duration_hours = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"{self.task.title}"