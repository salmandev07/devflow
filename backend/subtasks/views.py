from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from tasks.models import Task
from activities.models import Activity
from .models import Subtask
from .serializers import SubtaskSerializer



class SubtaskListView(generics.ListAPIView):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subtask.objects.all()


class SubtaskListCreateView(generics.ListCreateAPIView):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]
        return Subtask.objects.filter(
            task_id=task_id
        ).order_by("-created_at")

    def perform_create(self, serializer):
        task_id = self.kwargs["task_id"]

        task = Task.objects.get(id=task_id)

        subtask = serializer.save(task=task)

        Activity.objects.create(
            user=self.request.user,
            action="create",
            task=task,
            project=task.project,
            team=task.team,
            message=f"Created subtask '{subtask.title}'"
        )

class SubtaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        old_subtask = self.get_object()

        was_completed = old_subtask.completed

        subtask = serializer.save()

        if not was_completed and subtask.completed:
            Activity.objects.create(
                user=self.request.user,
                action="update",
                task=subtask.task,
                project=subtask.task.project,
                team=subtask.task.team,
                message=f"Completed subtask '{subtask.title}'"
            )

    def perform_destroy(self, instance):
        Activity.objects.create(
            user=self.request.user,
            action="delete",
            task=instance.task,
            project=instance.task.project,
            team=instance.task.team,
            message=f"Deleted subtask '{instance.title}'"
        )

        instance.delete()