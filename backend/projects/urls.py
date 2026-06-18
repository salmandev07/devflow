from django.urls import path

from .views import ( ProjectListCreateView, ProjectDetailView )
from .report_views import ( ProjectReportView )

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
        "<int:project_id>/report/",
        ProjectReportView.as_view(),
        name="project-report",
    ),
    
]