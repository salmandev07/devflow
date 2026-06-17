from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/auth/",
        include("users.urls")
    ),

    path(
        "api/projects/",
        include("projects.urls")
    ),

    path(
        "api/teams/",
        include("teams.urls")
    ),

    path(
        "api/tasks/",
        include("tasks.urls")
    ),

    path(
        "api/users/",
        include("users.urls")
    ),

    path(
        "api/activities/",
        include("activities.urls")
    ),

    path(
        "api/comments/",
        include("comments.urls")
    ),

    path(
        "api/attachments/",
        include("attachments.urls")
    ),

    path(
        "api/notifications/",
        include("notifications.urls")
    ),

    path(
        "api/subtasks/",
        include("subtasks.urls")
    ),
]


urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)