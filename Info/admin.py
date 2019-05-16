from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .forms import *
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


class CountryAdmin(ModelAdmin):
    # The forms to add and change institution
    form = CountryCreation
    add_form = CountryCreation
    table_name = 'Add country'
    list_display = ('name', 'flag')
    fieldsets = (
        ("new {}".format(table_name), {'fields': ('name', 'flag')}),
        ('Flag', {'fields': ('flag_tag',)}),
    )

    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('flag_tag',)


admin.site.register(Institution, InstitutionAdmin)
admin.site.register(Country, CountryAdmin)

admin.site.site_url = None
admin.site.site_header = "Ntech admin panel"
