from django import forms
from django.contrib.auth.forms import UserCreationForm, SetPasswordForm
from django.contrib.auth.models import User

from Info.models import Institution, Country
from .models import Profile
from .utilities import ObjectMatcher

# Matching arguments used by ObjectMatcher. See documentation in the utilities file
MATCH_CRITERIA = {
    "ignore": ["university", "college", "institute", "technology", "science", "agriculture"],
    "strict": False,
    "fields": ["name"],
    "match_ratio": 0.75,
    "sample": None,
}


class InstitutionResolutionField(forms.ModelChoiceField):

    def validate(self, value):
        return self.to_python(value)

    def to_python(self, value):
        if str(value).isdigit():
            inst = Institution.objects.filter(id=int(value))
            if inst.exists():
                return inst[0]
        return None


class SignUpForm(UserCreationForm):
    GENDER = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    country = forms.ModelChoiceField(queryset=Country.objects)

    institution = InstitutionResolutionField(queryset=Institution.objects)

    gender = forms.ChoiceField(choices=GENDER,
                               label="",
                               initial='',
                               widget=forms.Select(),
                               required=True)

    mobile = forms.CharField(max_length=50)
    date_of_birth = forms.DateField()
    skills = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email', 'password1', 'password2', 'country', 'institution',
            'mobile',
            'gender', 'date_of_birth', 'skills']

    def __init__(self, *args, **kwargs):
        super(SignUpForm, self).__init__(*args, **kwargs)
        if args:
            self.post_data = args[0]
        else:
            self.post_data = {}

    def countries(self):
        return self.fields["country"].queryset

    def institutions(self):
        return self.fields["institution"].queryset

    def clean_institution(self):
        match_criteria = MATCH_CRITERIA
        match_criteria["sample"] = self.post_data.get("new_institution")
        if not self.cleaned_data.get("institution"):
            institution = ObjectMatcher(Institution.objects.all(), **match_criteria).get_match()
            if not institution:
                institution = Institution.objects.create(
                    name=match_criteria.get("sample"),
                    country=self.cleaned_data.get("country"),
                )
            return institution
        return self.cleaned_data.get("institution")

    def clean_mobile(self):
        #  Merge country code with the mobile number
        return int(str(self.post_data.get("code", 254)) + str(self.cleaned_data.get('mobile')))


class ProfileUpdateForm(forms.ModelForm):
    institution = InstitutionResolutionField(queryset=Institution.objects)

    def __init__(self, *args, **kwargs):
        super(ProfileUpdateForm, self).__init__(*args, **kwargs)
        if args:
            self.post_data = args[0]
        else:
            self.post_data = {}

    def clean_institution(self):
        match_criteria = MATCH_CRITERIA
        match_criteria["sample"] = self.post_data.get("new_institution")
        if not self.cleaned_data.get("institution"):
            institution = ObjectMatcher(Institution.objects.all(), **match_criteria).get_match()
            if not institution:
                institution = Institution.objects.create(
                    name=match_criteria.get("sample"),
                    country=self.cleaned_data.get("country"),
                )
            return institution
        return self.cleaned_data.get("institution")

    class Meta:
        model = Profile
        fields = ('institution', 'skills', 'date_of_birth', 'gender', 'country', 'mobile', 'avatar')

    def clean_mobile(self):
        #  Merge country code with the mobile number
        return int(str(self.post_data.get("code", 254)) + str(self.cleaned_data.get('mobile')))


class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')


class PasswordChangeForm(SetPasswordForm):
    """
    A form that lets a user change their password by entering their old
    password.
    """

    error_messages = dict(SetPasswordForm.error_messages, **{
        'password_incorrect': "Your old password was entered incorrectly. Please enter it again.",
    })
    old_password = forms.CharField(label="Old password", widget=forms.PasswordInput)

    def clean_old_password(self):
        """
        Validates that the old_password field is correct.
        """
        old_password = self.cleaned_data["old_password"]
        if not self.user.check_password(old_password):
            raise forms.ValidationError(
                self.error_messages['password_incorrect'],
                code='password_incorrect',
            )
        return old_password
