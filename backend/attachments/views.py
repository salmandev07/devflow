import os

from django.db.models import Q

from rest_framework import generics, serializers, status
from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response

from tasks.models import Task
from .models import TaskAttachment
from .serializers import (
    TaskAttachmentSerializer,
)

ALLOWED_UPLOAD_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".pdf", ".doc", ".docx", ".txt", ".md",
    ".csv", ".xlsx", ".xls",
    ".zip", ".tar", ".gz",
    ".py", ".js", ".ts", ".tsx", ".jsx",
    ".json", ".yaml", ".yml",
}
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _accessible_tasks(user):
    return Task.objects.filter(
        Q(project__owner=user) | Q(project__teams__members=user)
    ).distinct()


class AttachmentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = TaskAttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]

        return TaskAttachment.objects.select_related("uploaded_by").filter(
            task_id=task_id,
            task__in=_accessible_tasks(self.request.user),
        ).order_by("-uploaded_at")

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES.get("file")
        if uploaded_file:
            ext = os.path.splitext(uploaded_file.name)[1].lower()
            if ext not in ALLOWED_UPLOAD_EXTENSIONS:
                raise serializers.ValidationError(
                    {"file": f"File type '{ext}' is not allowed."}
                )
            if uploaded_file.size > MAX_UPLOAD_SIZE_BYTES:
                raise serializers.ValidationError(
                    {"file": "File size must be under 10 MB."}
                )
        serializer.save(uploaded_by=self.request.user)


class AttachmentDeleteView(
    generics.DestroyAPIView
):
    serializer_class = TaskAttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskAttachment.objects.filter(
            task__in=_accessible_tasks(self.request.user)
        )