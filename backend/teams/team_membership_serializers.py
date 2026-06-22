from rest_framework import serializers

from .models import TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username", read_only=True
    )

    class Meta:
        model = TeamMembership
        fields = ["id", "team", "user", "username", "role"]

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
        team = data.get("team") or (
            self.instance.team if self.instance else None
        )
        user = data.get("user") or (
            self.instance.user if self.instance else None
        )

        if team and user:
            if TeamMembership.objects.filter(
                team=team, user=user
            ).exclude(pk=self.instance.pk if self.instance else None).exists():
                raise serializers.ValidationError(
                    {"user": "This user is already a member of this team"}
                )

        return data
