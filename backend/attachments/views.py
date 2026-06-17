from rest_framework import generics
from rest_framework.permissions import (
    IsAuthenticated,
)

from .models import TaskAttachment
from .serializers import (
    TaskAttachmentSerializer,
)


class AttachmentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = (
        TaskAttachmentSerializer
    )
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]

        return TaskAttachment.objects.filter(
            task_id=task_id
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            uploaded_by=self.request.user
        )


class AttachmentDeleteView(
    generics.DestroyAPIView
):
    queryset = TaskAttachment.objects.all()
    serializer_class = (
        TaskAttachmentSerializer
    )
    permission_classes = [
        IsAuthenticated
    ]