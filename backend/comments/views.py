from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from tasks.models import Task
from .models import Comment
from .serializers import CommentSerializer


def _accessible_tasks(user):
    return Task.objects.filter(
        Q(project__owner=user) | Q(project__teams__members=user)
    ).distinct()


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]
        return Comment.objects.select_related("user").filter(
            task_id=task_id,
            task__in=_accessible_tasks(self.request.user),
        ).order_by("-created_at")

    def perform_create(self, serializer):
        task_id = self.kwargs["task_id"]
        task = _accessible_tasks(self.request.user).filter(id=task_id).first()
        if not task:
            raise PermissionDenied("Task not found or access denied.")
        serializer.save(user=self.request.user, task=task)


class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            task__in=_accessible_tasks(self.request.user)
        )

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own comments.")
        instance.delete()
