from django.db.models.signals import post_save
from django.dispatch import receiver

from projects.models import Project
from teams.models import Team

from .models import Activity


@receiver(post_save, sender=Project)
def project_created(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(
            user=instance.owner,
            action="create",
            project=instance,
            message=(
                f"{instance.owner.username} "
                f"created project "
                f"{instance.name}"
            ),
        )


@receiver(post_save, sender=Team)
def team_created(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(
            user=instance.owner,
            action="create",
            team=instance,
            message=(
                f"{instance.owner.username} "
                f"created team "
                f"{instance.name}"
            ),
        )
