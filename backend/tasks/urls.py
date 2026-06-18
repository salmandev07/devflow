from django.urls import path

from .views import (
    TaskListCreateView,
    TaskDetailView,
    StartTimerView,
    StopTimerView,
    TimerStatusView,
    TimeSessionListView,
)

urlpatterns = [
    path(
        "",
        TaskListCreateView.as_view(),
        name="tasks"
    ),

    path(
        "<int:pk>/",
        TaskDetailView.as_view(),
        name="task-detail"
    ),

    path(
        "<int:task_id>/start-timer/",
        StartTimerView.as_view(),
        name="start-timer",
    ),

    path(
        "<int:task_id>/stop-timer/",
        StopTimerView.as_view(),
        name="stop-timer",
    ),

    path(
        "<int:task_id>/timer-status/",
        TimerStatusView.as_view(),
        name="timer-status",
    ),

    path(
        "<int:task_id>/sessions/",
        TimeSessionListView.as_view(),
        name="task-sessions",
    ),

]