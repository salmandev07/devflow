from rest_framework import generics
from rest_framework.permissions import (
    IsAuthenticated,
)

from .models import Comment
from .serializers import (
    CommentSerializer,
)


class CommentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]

        return Comment.objects.filter(
            task_id=task_id
        )

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
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]