# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0002_projectteam_project_teams"),
        ("teams", "0002_teammembership"),
    ]

    operations = [
        migrations.AddField(
            model_name="team",
            name="project",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="project_teams_direct",
                to="projects.project",
            ),
        ),
    ]
