from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from tasks.models import Task

from .models import Subtask
from .serializers import SubtaskSerializer


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

        serializer.save(task=task)


class SubtaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]