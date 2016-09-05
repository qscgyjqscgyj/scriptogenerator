from django.core.urlresolvers import reverse

from django.views.generic import UpdateView
from registration.backends.default.views import RegistrationView

from users.forms import UserProfileForm
from users.models import CustomUser


class UserProfileView(UpdateView):
    model = CustomUser
    form_class = UserProfileForm
    template_name_suffix = '_profile_form'
    success_url = '.'

    def get_object(self, queryset=None):
        return self.request.user


class CustomRegistrationView(RegistrationView):
    def get_success_url(self, user=None):
        if 'next' in self.request.GET.keys():
            return self.request.GET['next']
        else:
            return reverse('vibe_creation', current_app='main')
