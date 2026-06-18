from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import ( Team, TeamMembership, )
from .serializers import TeamSerializer
from .team_membership_serializers import ( TeamMembershipSerializer, )
  

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
    
class TeamMembershipListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        team_id = self.kwargs["team_id"]

        return TeamMembership.objects.filter(
            team_id=team_id
        )

    def perform_create(self, serializer):
        membership = serializer.save()

        membership.team.members.add(
            membership.user
        )


class TeamMembershipDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = TeamMembership.objects.all()
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(
        self,
        instance
    ):
        instance.team.members.remove(
            instance.user
        )

        instance.delete()