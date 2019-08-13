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


class EventForm(ModelForm):
    class Meta:
        model = Event
        fields = ("name", "start_date", "start_time", "end_date", "end_time", "description")
