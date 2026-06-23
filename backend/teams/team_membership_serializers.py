from rest_framework import serializers

from .models import Team, TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username", read_only=True
    )

    class Meta:
        model = TeamMembership
        fields = ["id", "team", "user", "username", "role"]
        extra_kwargs = {"team": {"read_only": True}}

    def validate_user(self, value):
        if value.is_superuser:
            raise serializers.ValidationError(
                "Superuser accounts cannot be added to teams"
            )
        if not value.is_active:
            raise serializers.ValidationError(
                "Inactive users cannot be added to teams"
            )
        return value

    def validate(self, data):
        user = data.get("user")
        team_id = self.context["view"].kwargs.get("team_id")
        if user and team_id:
            try:
                team = Team.objects.get(id=team_id)
            except Team.DoesNotExist:
                raise serializers.ValidationError(
                    {"team": "Team not found"}
                )
            if user == team.owner:
                raise serializers.ValidationError(
                    {"user": "The team owner is already a member"}
                )
            if TeamMembership.objects.filter(
                team_id=team_id, user=user
            ).exclude(pk=self.instance.pk if self.instance else None).exists():
                raise serializers.ValidationError(
                    {"user": "User is already a team member"}
                )
        return data
