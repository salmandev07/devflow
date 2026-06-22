from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="projects"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    teams = models.ManyToManyField(
        "teams.Team",
        through="ProjectTeam",
        related_name="projects",
        blank=True,
    )

    def __str__(self):
        return self.name


class ProjectTeam(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="project_teams"
    )
    team = models.ForeignKey(
        "teams.Team",
        on_delete=models.CASCADE,
        related_name="team_projects"
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "team")
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.project.name} ← {self.team.name}"