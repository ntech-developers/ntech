from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .forms import InstitutionCreation
from .models import Institution


class InstitutionAdmin(ModelAdmin):
    # The forms to add and change institution
    form = InstitutionCreation
    add_form = InstitutionCreation
    table_name = 'institution'
    list_display = ('name',)
    fieldsets = (
        ("new {}".format(table_name), {'fields': ('name',)}),
    )

    search_fields = ('name',)
    ordering = ('name',)


admin.site.register(Institution, InstitutionAdmin)

admin.site.site_url = None
admin.site.site_header = "Ntech admin panel"
