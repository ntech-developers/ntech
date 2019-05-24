from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .forms import ProfileUpdateForm
from .models import Profile


class ProfileAdmin(ModelAdmin):
    form = ProfileUpdateForm
    table_name = 'Profile update'
    list_display = ('user', 'institution', 'date_of_birth', 'gender', 'country', 'mobile')
    list_filter = ('country', 'institution', 'gender')
    fieldsets = (
        (table_name,
         {'fields': ('user', 'institution', 'skills', 'date_of_birth', 'gender', 'country', 'mobile')}),
    )
    search_fields = ('institution',)
    ordering = ('institution',)
    readonly_fields = ('user',)
    filter_horizontal = ()


admin.site.register(Profile, ProfileAdmin)
