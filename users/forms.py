# -*- coding: utf-8 -*-
from _mysql_exceptions import IntegrityError
from django import forms
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from registration.forms import RegistrationForm
from registration.users import UsernameField

from users.models import CustomUser
from django.utils.translation import ugettext_lazy as _


class CustomRegistrationForm(RegistrationForm):
    email = forms.EmailField(required=True)
    username = forms.CharField(required=False)

    def clean(self):
        cleaned_data = super(CustomRegistrationForm, self).clean()
        try:
            CustomUser.objects.get(username=cleaned_data.get('email'))
            self.add_error('email', u'Пользователь с таким email уже существует')
            # raise forms.ValidationError()
        except ObjectDoesNotExist:
            return self.cleaned_data

    def save(self, commit=True):
        user = super(CustomRegistrationForm, self).save(commit=False)
        user.username = user.email
        if commit:
            user.save()
        return user

    class Meta:
        model = CustomUser
        fields = (UsernameField(), 'email')


class UserProfileForm(forms.ModelForm):

    class Meta:
        model = CustomUser
        fields = ()
