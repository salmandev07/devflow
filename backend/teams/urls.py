from django.urls import path

from .views import (
    TeamListCreateView,
    TeamDetailView,
    TeamMembershipListCreateView,
    TeamMembershipDetailView,
    TeamTransferOwnershipView,
)

urlpatterns = [
    path("", TeamListCreateView.as_view(), name="teams"),
    path("<int:pk>/", TeamDetailView.as_view(), name="team-detail"),
    path(
        "<int:pk>/transfer-ownership/",
        TeamTransferOwnershipView.as_view(),
        name="team-transfer-ownership",
    ),
    path(
        "<int:team_id>/members/",
        TeamMembershipListCreateView.as_view(),
        name="team-members",
    ),
    path(
        "memberships/<int:pk>/",
        TeamMembershipDetailView.as_view(),
        name="team-membership-detail",
    ),
]
