from django.contrib import admin

from .models import Subtask


@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "task",
        "completed",
        "created_at",
    )

    list_filter = (
        "completed",
    )

    search_fields = (
        "title",
    )