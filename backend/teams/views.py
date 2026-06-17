from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Team
from .serializers import TeamSerializer
  

class TeamListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(
            owner=self.request.user
        )

    def perform_create(self, serializer):
        team = serializer.save(
            owner=self.request.user
        )

        team.members.add(
            self.request.user
        )


class TeamDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(
            owner=self.request.user
        )