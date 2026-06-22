from decimal import Decimal

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import TaskSerializer
from activities.models import Activity
from projects.models import Project

from .models import Task, TimeSession
from .time_session_serializers import TimeSessionSerializer


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            Q(project__owner=self.request.user)
            | Q(project__teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        task = serializer.save()
        Activity.objects.create(
            user=self.request.user,
            action="create",
            task=task,
            project=task.project,
            team=task.team,
            message=f"Created task '{task.title}'",
        )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            Q(project__owner=self.request.user)
            | Q(project__teams__members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status
        task = serializer.save()

        if old_status != task.status:
            status_names = {
                "todo": "Todo",
                "progress": "In Progress",
                "done": "Done",
            }
            Activity.objects.create(
                user=self.request.user,
                action="move",
                task=task,
                project=task.project,
                team=task.team,
                message=f"Moved task '{task.title}' to {status_names.get(task.status, task.status)}",
            )
        else:
            Activity.objects.create(
                user=self.request.user,
                action="update",
                task=task,
                project=task.project,
                team=task.team,
                message=f"Updated task '{task.title}'",
            )

    def perform_destroy(self, instance):
        Activity.objects.create(
            user=self.request.user,
            action="delete",
            project=instance.project,
            team=instance.team,
            message=f"Deleted task '{instance.title}'",
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

        task.actual_hours = task.actual_hours + session.duration_hours
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
            TimeSession.objects.filter(
                task_id=self.kwargs["task_id"],
                task__in=Task.objects.filter(
                    Q(project__owner=self.request.user)
                    | Q(project__teams__members=self.request.user)
                ).distinct(),
            )
            .order_by("-started_at")
        )
