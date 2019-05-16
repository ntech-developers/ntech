from django.forms import ModelForm

from .models import *


class InstitutionCreation(ModelForm):
    class Meta:
        model = Institution
        fields = ("name",)


class CountryCreation(ModelForm):
    class Meta:
        model = Country
        fields = ("name", "flag")
