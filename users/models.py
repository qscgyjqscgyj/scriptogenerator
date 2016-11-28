from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User, AbstractUser, UserManager
from django.db import models
from registration.signals import user_registered


class CustomUser(AbstractUser):

    objects = UserManager()

    def __unicode__(self):
        return self.username

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'


def user_created(sender, user, request, **kwargs):
    login(request, authenticate(
        username=user.username,
        password=request.POST['password1']
    ))

user_registered.connect(user_created)
