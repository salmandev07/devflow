from django.db.models.signals import post_save
from django.db.models.signals import post_delete
from django.db.models.signals import pre_save

from django.dispatch import receiver
from projects.models import Project
from teams.models import Team
from tasks.models import Task

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
            )
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
            )
        )

@receiver(post_save, sender=Task)
def task_created(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(
            user=instance.project.owner,
            action="create",
            task=instance,
            message=(
                f"{instance.project.owner.username} "
                f"created task "
                f"{instance.title}"
            )
        )

@receiver(post_delete, sender=Task)
def task_deleted(sender, instance, **kwargs):
    Activity.objects.create(
        user=instance.project.owner,
        action="delete",
        message=(
            f"{instance.project.owner.username} "
            f"deleted task "
            f"{instance.title}"
        )
    )

@receiver(pre_save, sender=Task)
def task_updated(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_task = Task.objects.get(pk=instance.pk)
    except Task.DoesNotExist:
        return

    if old_task.status != instance.status:
        Activity.objects.create(
            user=instance.project.owner,
            action="move",
            task=instance,
            message=(
                f"{instance.project.owner.username} "
                f"moved task "
                f"{instance.title} "
                f"to {instance.get_status_display()}"
            )
        )
        return

    Activity.objects.create(
        user=instance.project.owner,
        action="update",
        task=instance,
        message=(
            f"{instance.project.owner.username} "
            f"updated task "
            f"{instance.title}"
        )
    )