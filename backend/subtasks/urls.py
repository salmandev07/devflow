from django.urls import path

from .views import (
    SubtaskListView,
    SubtaskListCreateView,
    SubtaskDetailView,
)

urlpatterns = [

    path(
        "",
        SubtaskListView.as_view(),
        name="subtask-list",
    ),


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