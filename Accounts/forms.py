from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from Info.models import Institution, Country
from .models import Profile


class SignUpForm(UserCreationForm):
    GENDER = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )

    institution = forms.ModelChoiceField(queryset=Institution.objects)

    gender = forms.ChoiceField(choices=GENDER,
                               label="",
                               initial='',
                               widget=forms.Select(),
                               required=True)

    country = forms.ModelChoiceField(queryset=Country.objects)

    mobile = forms.CharField(max_length=50)
    date_of_birth = forms.DateField()
    skills = forms.TextInput()

    class Meta:
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'email', 'password1', 'password2', 'institution', 'mobile',
            'gender', 'country', 'date_of_birth')
        help_texts = {
            'username': None,
            'email': None,
            'password1': None,
            'password2': None,
        }

    def __init__(self, *args, **kwargs):
        super(SignUpForm, self).__init__(*args, **kwargs)
        if args:
            self.post_data = args[0]
        else:
            self.post_data = {}

        for field_name in ('username', 'password1', 'password2'):
            self.fields[field_name].help_text = None

    def countries(self):
        return self.fields["country"].queryset

    def institutions(self):
        return self.fields["institution"].queryset

    def clean_mobile(self):
        #  Merge country code with the mobile number
        return int(str(self.post_data.get("code", 254)) + str(self.cleaned_data.get('mobile')))


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('institution', 'skills', 'date_of_birth', 'gender', 'country', 'mobile')
