from django.db.models import Q

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Team, TeamMembership
from .serializers import TeamSerializer
from .team_membership_serializers import TeamMembershipSerializer


class TeamListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct().order_by("-created_at")

    def perform_create(self, serializer):
        team = serializer.save(owner=self.request.user)
        team.members.add(self.request.user)


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct().order_by("-created_at")


class TeamMembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        team_id = self.kwargs["team_id"]
        return TeamMembership.objects.filter(
            team_id=team_id,
            team__in=Team.objects.filter(
                Q(owner=self.request.user) | Q(members=self.request.user)
            ),
        ).order_by("-id")

    def perform_create(self, serializer):
        membership = serializer.save()
        membership.team.members.add(membership.user)


class TeamMembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeamMembership.objects.filter(
            team__in=Team.objects.filter(
                Q(owner=self.request.user) | Q(members=self.request.user)
            ),
        ).order_by("-id")

    def perform_destroy(self, instance):
        instance.team.members.remove(instance.user)
        instance.delete()


class TeamTransferOwnershipView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            team = Team.objects.get(pk=pk, owner=request.user)
        except Team.DoesNotExist:
            return Response(
                {"detail": "Team not found or you are not the owner"},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_owner_id = request.data.get("new_owner_id")
        if not new_owner_id:
            return Response(
                {"detail": "new_owner_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not team.members.filter(id=new_owner_id).exists():
            return Response(
                {"detail": "New owner must be a current team member"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        team.owner_id = new_owner_id
        team.save()

        serializer = TeamSerializer(team)
        return Response(serializer.data)
