from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import (
    IsAuthenticated,
)

from tasks.models import Task
from .models import Comment
from .serializers import (
    CommentSerializer,
)


def _accessible_tasks(user):
    return Task.objects.filter(
        Q(project__owner=user) | Q(project__teams__members=user)
    ).distinct()


class CommentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]

        return Comment.objects.filter(
            task_id=task_id,
            task__in=_accessible_tasks(self.request.user),
        ).order_by("-created_at")

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )


class CommentDeleteView(
    generics.DestroyAPIView
):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            task__in=_accessible_tasks(self.request.user)
        )