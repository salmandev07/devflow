from django.urls import path

from .views import (
    AttachmentListCreateView,
    AttachmentDeleteView,
)

urlpatterns = [
    path(
        "tasks/<int:task_id>/attachments/",
        AttachmentListCreateView.as_view(),
        name="task-attachments",
    ),

    path(
        "<int:pk>/",
        AttachmentDeleteView.as_view(),
        name="attachment-delete",
    ),
]