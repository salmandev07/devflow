from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Project
from tasks.models import Task


class ProjectReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(
            Project.objects.filter(
                Q(owner=request.user) | Q(teams__members=request.user)
            ).distinct(),
            id=project_id,
        )

        tasks = Task.objects.filter(project=project)

        completed = tasks.filter(status="done").count()
        progress = tasks.filter(status="progress").count()
        todo = tasks.filter(status="todo").count()

        estimated_hours = sum(task.estimated_hours for task in tasks)
        actual_hours = sum(task.actual_hours for task in tasks)

        return Response({
            "project": project.name,
            "total_tasks": tasks.count(),
            "completed": completed,
            "progress": progress,
            "todo": todo,
            "estimated_hours": estimated_hours,
            "actual_hours": actual_hours,
        })
