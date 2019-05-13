from django.forms import ModelForm

from .models import Institution


class InstitutionCreation(ModelForm):
    class Meta:
        model = Institution
        fields = ("name",)
