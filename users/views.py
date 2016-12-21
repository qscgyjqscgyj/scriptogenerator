from django.contrib.sites.models import Site, RequestSite
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.shortcuts import redirect

from django.views.generic import UpdateView
from django.views.generic import View
from registration import signals
from registration.backends.default.views import RegistrationView
from registration.models import RegistrationProfile
from registration.users import UserModel

from main.views import JSONResponse
from scripts.settings import DEBUG
from users.forms import UserProfileForm
from users.models import CustomUser, UserAccess
import json

from users.serializers import UserAccessSerializer, UserSerializer


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


class ProfileView(View):
    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        user = UserSerializer(data=data)
        current_user = CustomUser.objects.get(pk=int(data['id']))
        if user.is_valid():
            user.update(current_user, data)
            return JSONResponse({
                'session_user': UserAccessSerializer(current_user).data
            })
        return JSONResponse(user.errors, status=400)


class TeamView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            user = CustomUser.objects.get(username=data['email'])
            del data['email']
            data['user'] = user
            data['owner'] = request.user
            access = UserAccessSerializer(data=data)
            if access.is_valid():
                access.create(data)
                return JSONResponse({
                    'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
                })
            return JSONResponse(access.errors, status=400)
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'User does not exist'}, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        access = UserAccessSerializer(data=data)
        if access.is_valid():
            access.update(UserAccess.objects.get(pk=int(data['id'])), data)
            return JSONResponse({
                'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(access.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            access = UserAccess.objects.get(pk=int(data['id']))
            access.delete()
            return JSONResponse({
                'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)
