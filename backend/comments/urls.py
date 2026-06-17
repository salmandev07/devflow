from django.urls import path

from .views import (
    CommentListCreateView,
    CommentDeleteView,
)

urlpatterns = [
    path(
        "tasks/<int:task_id>/comments/",
        CommentListCreateView.as_view(),
        name="task-comments",
    ),

    path(
        "<int:pk>/",
        CommentDeleteView.as_view(),
        name="comment-delete",
    ),
]