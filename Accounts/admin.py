from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import ParticipantChangeForm, ParticipantCreationForm
from .models import Participant


class ParticipantAdmin(UserAdmin):
    form = ParticipantChangeForm
    add_form = ParticipantCreationForm
    table_name = 'Participant registration'
    list_display = ('identification', 'name', 'username', 'email', 'mobile', 'institution', 'country', 'gender')
    list_filter = ('country', 'institution', 'gender')
    fieldsets = (
        ("new {}".format(table_name),
         {'fields': ('identification', 'name', 'email', 'username', 'mobile', 'institution', 'country', 'password',
                     'gender')}),
        ('Avatar', {'fields': ('avatar_tag',)}),
    )
    add_fieldsets = ((None, {'fields': ('password1', 'password2', 'identification', 'name', 'email', 'mobile', 'gender',
                                        'institution', 'country', 'password', 'last_login'), 'classes': ('wide',)}),)
    search_fields = ('name', 'email', 'username')
    ordering = ('name',)
    readonly_fields = ('last_login', 'avatar_tag')
    filter_horizontal = ()


admin.site.register(Participant, ParticipantAdmin)
