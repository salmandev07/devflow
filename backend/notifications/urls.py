from django.urls import path

from .views import (
    NotificationListView,
    NotificationDetailView,
    UnreadCountView,
    MarkAllReadView,
)

urlpatterns = [
    path(
        "",
        NotificationListView.as_view(),
        name="notifications",
    ),
    path(
        "unread-count/",
        UnreadCountView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "mark-all-read/",
        MarkAllReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path(
        "<int:pk>/",
        NotificationDetailView.as_view(),
        name="notification-detail",
    ),
]
