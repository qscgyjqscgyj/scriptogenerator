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

from main.utils import create_active_user
from main.views import JSONResponse
from payment.models import LocalPayment
from payment.serializers import LocalPaymentSerializer
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
    success_url = 'main'

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
            request=self.request,
            # send_email=self.SEND_ACTIVATION_EMAIL,
            send_email=False
        )
        signals.user_registered.send(sender=self.__class__,
                                     user=new_user,
                                     request=self.request)
        new_user.is_active = True
        new_user.utm = json.dumps({
            'referer_utms': self.request.session.get('referer_utms'),
            'get_params_utms': self.request.session.get('get_params_utms')
        })
        new_user.save()
        return new_user


class ProfileView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'local_payments': LocalPaymentSerializer(LocalPayment.objects.filter(user=request.user), many=True).data
        })

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        user = UserSerializer(data=data)
        current_user = CustomUser.objects.get(pk=int(data['id']))
        if user.is_valid():
            user.update(current_user, data)
            return JSONResponse({
                'session_user': UserSerializer(current_user).data
            })
        return JSONResponse(user.errors, status=400)


class TeamView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        email = data.get('email')
        last_name = data.get('last_name')
        first_name = data.get('first_name')
        middle_name = data.get('middle_name')
        phone = data.get('phone')
        del data['email']
        del data['last_name']
        del data['first_name']
        del data['middle_name']
        del data['phone']
        try:
            user = CustomUser.objects.get(username=email)
            user.last_name = last_name if not user.last_name else ''
            user.first_name = first_name if not user.first_name else ''
            user.middle_name = middle_name if not user.middle_name else ''
            user.phone = phone if not user.phone else ''
            user.save()
        except ObjectDoesNotExist:
            user = create_active_user(request=request, email=email, last_name=last_name, first_name=first_name, middle_name=middle_name, phone=phone)
        data['user'] = user
        data['owner'] = request.user
        access = UserAccessSerializer(data=data)
        if access.is_valid():
            if not UserAccess.objects.filter(owner=request.user, user__email=email):
                access.create(data)
            return JSONResponse({
                'session_user': UserSerializer(request.user).data,
                'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(access.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        access = UserAccessSerializer(data=data)
        if access.is_valid():
            access.update(UserAccess.objects.get(pk=int(data['id'])), data)
            return JSONResponse({
                'session_user': UserSerializer(request.user).data,
                'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(access.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            access = UserAccess.objects.get(pk=int(data['id']))
            access.delete()
            return JSONResponse({
                'session_user': UserSerializer(request.user).data,
                'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)
