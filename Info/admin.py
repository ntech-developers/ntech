from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .forms import *
from .models import Institution


class InstitutionAdmin(ModelAdmin):
    # The forms to add and change institution
    form = InstitutionCreation
    add_form = InstitutionCreation
    table_name = 'institution'
    list_display = ('id', 'name', 'country')
    list_filter = ('country',)
    fieldsets = (
        ("new {}".format(table_name), {'fields': ('id', 'name', 'country')}),
    )

    search_fields = ('name',)
    readonly_fields = ('id',)
    ordering = ('name',)


class CountryAdmin(ModelAdmin):
    # The forms to add and change institution
    form = CountryCreation
    add_form = CountryCreation
    table_name = 'Add country'
    list_display = ('name', 'flag', 'code')
    fieldsets = (
        ("new {}".format(table_name), {'fields': ('name', 'flag', 'code')}),
        ('Flag', {'fields': ('flag_tag',)}),
    )

    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('flag_tag',)


admin.site.register(Institution, InstitutionAdmin)
admin.site.register(Country, CountryAdmin)

admin.site.site_url = None
admin.site.site_header = "Ntech admin panel"
