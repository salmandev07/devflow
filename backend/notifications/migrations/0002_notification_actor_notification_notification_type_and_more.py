import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='actor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='triggered_notifications', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('task_assigned', 'Task Assigned'), ('task_unassigned', 'Task Unassigned'), ('task_status_changed', 'Task Status Changed'), ('task_completed', 'Task Completed'), ('comment_added', 'Comment Added'), ('mention', 'Mention'), ('attachment_added', 'Attachment Added'), ('team_member_added', 'Team Member Added'), ('team_member_removed', 'Team Member Removed'), ('project_created', 'Project Created'), ('subtask_completed', 'Subtask Completed')], default='comment_added', max_length=30),
        ),
        migrations.AddField(
            model_name='notification',
            name='url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'is_read'], name='notificatio_user_id_427e4b_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['-created_at'], name='notificatio_created_ae6ed6_idx'),
        ),
    ]
