from django import forms
from registration.forms import RegistrationForm
from registration.users import UsernameField

from users.models import CustomUser
from django.utils.translation import ugettext_lazy as _


class CustomRegistrationForm(RegistrationForm):
    web_site = forms.URLField(label=_('Web site'), required=False)

    class Meta:
        model = CustomUser
        fields = (UsernameField(), 'email', 'web_site')


class UserProfileForm(forms.ModelForm):
    web_site = forms.URLField(label=_('Web site'), required=False)

    class Meta:
        model = CustomUser
        fields = ('web_site', )
