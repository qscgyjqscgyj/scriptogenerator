from django.contrib.sites.models import Site, RequestSite
from django.contrib.sites.shortcuts import get_current_site
from django.core.urlresolvers import reverse
from django.shortcuts import redirect

from django.views.generic import UpdateView
from registration import signals
from registration.backends.default.views import RegistrationView
from registration.models import RegistrationProfile
from registration.users import UserModel

from scripts.settings import DEBUG
from users.forms import UserProfileForm
from users.models import CustomUser


class UserProfileView(UpdateView):
    model = CustomUser
    form_class = UserProfileForm
    template_name_suffix = '_profile_form'
    success_url = '.'

    def get_object(self, queryset=None):
        return self.request.user

    def get_context_data(self, **kwargs):
        context = super(UserProfileView, self).get_context_data(**kwargs)
        context['DEBUG'] = DEBUG
        return context


class CustomRegistrationView(RegistrationView):
    def register(self, form):
        site = get_current_site(self.request)
        form.cleaned_data['username'] = form.cleaned_data['email']

        if hasattr(form, 'save'):
            new_user_instance = form.save()
        else:
            new_user_instance = (UserModel().objects.create_user(**form.cleaned_data))

        new_user = RegistrationProfile.objects.create_inactive_user(
            new_user=new_user_instance,
            site=site,
            send_email=self.SEND_ACTIVATION_EMAIL,
            request=self.request,
        )
        signals.user_registered.send(sender=self.__class__,
                                     user=new_user,
                                     request=self.request)
        return new_user
