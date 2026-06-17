from django.urls import path

from .views import (
    TeamListCreateView,
    TeamDetailView,
)

urlpatterns = [
    path(
        "",
        TeamListCreateView.as_view(),
        name="teams",
    ),

    path(
        "<int:pk>/",
        TeamDetailView.as_view(),
        name="team-detail",
    ),
]