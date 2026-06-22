from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Activity
from .serializers import ActivitySerializer


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(
            Q(project__owner=self.request.user)
            | Q(project__teams__members=self.request.user)
            | Q(team__owner=self.request.user)
            | Q(team__members=self.request.user)
            | Q(user=self.request.user)
        ).distinct().order_by("-created_at")
