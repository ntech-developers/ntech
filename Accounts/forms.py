from django.contrib.auth.forms import ReadOnlyPasswordHashField, UserCreationForm
from django.forms import ModelForm, PasswordInput, CharField, ValidationError

from .models import Participant


class ParticipantCreationForm(UserCreationForm):
    password1 = CharField(label='Password', widget=PasswordInput)
    password2 = CharField(label='Password confirmation', widget=PasswordInput)

    class Meta(UserCreationForm.Meta):
        model = Participant
        fields = ('identification', 'name', 'email', 'mobile', 'institution', 'gender', 'country', 'password', 'avatar',
                  'date_of_birth', 'skills', 'username')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):

        # Save the provided password in hashed format
        user = super(ParticipantCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class ParticipantChangeForm(ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = Participant
        fields = ('identification', 'name', 'email', 'mobile', 'institution', 'gender', 'country', 'password', 'avatar',
                  'date_of_birth', 'skills', 'username')
