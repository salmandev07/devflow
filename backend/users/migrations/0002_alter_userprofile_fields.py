from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userprofile",
            name="bio",
        ),
        migrations.RemoveField(
            model_name="userprofile",
            name="phone",
        ),
        migrations.AddField(
            model_name="userprofile",
            name="full_name",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="position",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
    ]
