from django.urls import path

from .views import (
    SubtaskListCreateView,
    SubtaskDetailView,
)

urlpatterns = [
    path(
        "tasks/<int:task_id>/subtasks/",
        SubtaskListCreateView.as_view(),
        name="subtask-list-create",
    ),

    path(
        "<int:pk>/",
        SubtaskDetailView.as_view(),
        name="subtask-detail",
    ),
]