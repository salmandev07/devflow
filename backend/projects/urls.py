from django.urls import path

from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectAssignTeamView,
    ProjectUnassignTeamView,
)
from .report_views import ProjectReportView

urlpatterns = [
    path(
        "",
        ProjectListCreateView.as_view(),
        name="projects",
    ),
    path(
        "<int:pk>/",
        ProjectDetailView.as_view(),
        name="project-detail",
    ),
    path(
        "<int:project_id>/assign-team/",
        ProjectAssignTeamView.as_view(),
        name="project-assign-team",
    ),
    path(
        "<int:project_id>/unassign-team/",
        ProjectUnassignTeamView.as_view(),
        name="project-unassign-team",
    ),
    path(
        "<int:project_id>/report/",
        ProjectReportView.as_view(),
        name="project-report",
    ),
]
