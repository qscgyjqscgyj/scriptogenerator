from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User, AbstractUser, UserManager
from django.db import models
from registration.signals import user_registered


class CustomUser(AbstractUser):
    phone = models.CharField(max_length=1025, blank=True, null=True)

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


class UserAccess(models.Model):
    owner = models.ForeignKey(CustomUser, related_name='user_access_owner_custom_user')
    user = models.ForeignKey(CustomUser, related_name='user_access_user_custom_user')
    active = models.BooleanField(default=True)

    def __unicode__(self):
        return self.owner.__unicode__()
