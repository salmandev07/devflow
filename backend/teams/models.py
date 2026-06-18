from django.db import models
from django.contrib.auth.models import User


class Team(models.Model):
    name = models.CharField(max_length=255)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_teams"
    )

    members = models.ManyToManyField(
        User,
        related_name="teams"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


class TeamMembership(models.Model):
    ROLE_CHOICES = [
        ("lead", "Lead"),
        ("developer", "Developer"),
        ("tester", "Tester"),
        ("designer", "Designer"),
    ]

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="developer"
    )

    class Meta:
        unique_together = (
            "team",
            "user",
        )

    def __str__(self):
        return f"{self.user.username} - {self.role}"