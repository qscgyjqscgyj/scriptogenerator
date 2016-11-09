from django import forms
from registration.forms import RegistrationForm
from registration.users import UsernameField

from users.models import CustomUser
from django.utils.translation import ugettext_lazy as _


class CustomRegistrationForm(RegistrationForm):

    class Meta:
        model = CustomUser
        fields = (UsernameField(), 'email')


class UserProfileForm(forms.ModelForm):

    class Meta:
        model = CustomUser
        fields = ()
