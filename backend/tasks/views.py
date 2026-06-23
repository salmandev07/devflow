from decimal import Decimal

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import TaskSerializer
from activities.models import Activity
from notifications.helpers import create_notification
from teams.models import TeamMembership

from .models import Task, TimeSession
from .time_session_serializers import TimeSessionSerializer


def is_task_owner(user, task):
    """Check if user is project owner, team owner, or task creator (full permissions)."""
    if task.project and task.project.owner_id == user.id:
        return True
    if task.team and TeamMembership.objects.filter(
        team=task.team, user=user, role="lead"
    ).exists():
        return True
    if task.created_by_id == user.id:
        return True
    return False


def is_task_assignee(user, task):
    """Check if user is assigned to this task."""
    return task.assigned_to_id == user.id


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.select_related(
            "project", "team", "assigned_to"
        ).filter(
            Q(project__owner=self.request.user)
            | Q(project__teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if project and project.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner can create tasks.")
        task = serializer.save(created_by=self.request.user)
        Activity.objects.create(
            user=self.request.user,
            action="create",
            task=task,
            project=task.project,
            team=task.team,
            message=f"Created task '{task.title}'",
        )
        if task.assigned_to and task.assigned_to != self.request.user:
            create_notification(
                actor=self.request.user,
                user=task.assigned_to,
                notification_type="task_assigned",
                message=f"{self.request.user.username} assigned you to \"{task.title}\"",
                url=f"/tasks/{task.id}",
            )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.select_related(
            "project", "team", "assigned_to"
        ).filter(
            Q(project__owner=self.request.user)
            | Q(project__teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_update(self, serializer):
        task = serializer.instance
        user = self.request.user
        owner = is_task_owner(user, task)
        assignee = is_task_assignee(user, task)

        if not owner and not assignee:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to edit this task.")

        # Assignee can only change status
        if assignee and not owner:
            allowed_fields = {"status"}
            dirty = set(serializer.validated_data.keys())
            if not dirty.issubset(allowed_fields):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Assigned users can only change the task status.")
            if "assigned_to" in serializer.validated_data:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Assigned users cannot reassign tasks.")

        # Only owner can change assignee
        if not owner and "assigned_to" in serializer.validated_data:
            if serializer.validated_data["assigned_to"] != task.assigned_to:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only the project owner can assign tasks.")

        old_status = task.status
        old_assigned = task.assigned_to
        task = serializer.save()

        status_names = {
            "todo": "Todo",
            "progress": "In Progress",
            "done": "Done",
        }

        if old_status != task.status:
            Activity.objects.create(
                user=user,
                action="move",
                task=task,
                project=task.project,
                team=task.team,
                message=f"Moved task '{task.title}' to {status_names.get(task.status, task.status)}",
            )
            if task.assigned_to and task.assigned_to != user:
                if task.status == "done":
                    ntype = "task_completed"
                    msg = f"{user.username} completed \"{task.title}\""
                else:
                    ntype = "task_status_changed"
                    msg = f"{user.username} moved \"{task.title}\" to {status_names.get(task.status, task.status)}"
                create_notification(
                    actor=user,
                    user=task.assigned_to,
                    notification_type=ntype,
                    message=msg,
                    url=f"/tasks/{task.id}",
                )
        else:
            Activity.objects.create(
                user=user,
                action="update",
                task=task,
                project=task.project,
                team=task.team,
                message=f"Updated task '{task.title}'",
            )

        if task.assigned_to and task.assigned_to != old_assigned:
            if task.assigned_to and task.assigned_to != user:
                create_notification(
                    actor=user,
                    user=task.assigned_to,
                    notification_type="task_assigned",
                    message=f"{user.username} assigned you to \"{task.title}\"",
                    url=f"/tasks/{task.id}",
                )
            if old_assigned and old_assigned != user and old_assigned != task.assigned_to:
                create_notification(
                    actor=user,
                    user=old_assigned,
                    notification_type="task_unassigned",
                    message=f"{user.username} unassigned you from \"{task.title}\"",
                    url=f"/tasks/{task.id}",
                )

    def perform_destroy(self, instance):
        user = self.request.user
        if not is_task_owner(user, instance):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the project owner or task creator can delete tasks.")

        Activity.objects.create(
            user=user,
            action="delete",
            project=instance.project,
            team=instance.team,
            message=f"Deleted task '{instance.title}'",
        )
        if instance.assigned_to and instance.assigned_to != user:
            create_notification(
                actor=user,
                user=instance.assigned_to,
                notification_type="task_unassigned",
                message=f"{user.username} deleted task \"{instance.title}\"",
                url=f"/projects/{instance.project.id}",
            )
        instance.delete()


class StartTimerView(generics.CreateAPIView):
    serializer_class = TimeSessionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        task = get_object_or_404(
            Task.objects.filter(
                Q(project__owner=self.request.user)
                | Q(project__teams__members=self.request.user)
            ).distinct(),
            id=self.kwargs["task_id"],
        )

        active_session = TimeSession.objects.filter(
            task=task, user=request.user, ended_at__isnull=True
        ).first()

        if active_session:
            return Response(
                {"detail": "Timer already running"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = TimeSession.objects.create(
            task=task, user=request.user, started_at=timezone.now()
        )

        serializer = TimeSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StopTimerView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        task = get_object_or_404(
            Task.objects.filter(
                Q(project__owner=self.request.user)
                | Q(project__teams__members=self.request.user)
            ).distinct(),
            id=self.kwargs["task_id"],
        )

        session = TimeSession.objects.filter(
            task=task, user=request.user, ended_at__isnull=True
        ).first()

        if not session:
            return Response(
                {"detail": "No active timer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.ended_at = timezone.now()
        duration = (session.ended_at - session.started_at).total_seconds() / 3600
        session.duration_hours = Decimal(str(round(duration, 2)))
        session.save()

        task.save()

        return Response({"hours_added": session.duration_hours})


class TimerStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        task = get_object_or_404(
            Task.objects.filter(
                Q(project__owner=self.request.user)
                | Q(project__teams__members=self.request.user)
            ).distinct(),
            id=self.kwargs["task_id"],
        )
        active_session = TimeSession.objects.filter(
            task=task, user=request.user, ended_at__isnull=True
        ).first()

        return Response({"running": active_session is not None})


class TimeSessionListView(generics.ListAPIView):
    serializer_class = TimeSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            TimeSession.objects.select_related("user").filter(
                task_id=self.kwargs["task_id"],
                task__in=Task.objects.filter(
                    Q(project__owner=self.request.user)
                    | Q(project__teams__members=self.request.user)
                ).distinct(),
            )
            .order_by("-started_at")
        )
