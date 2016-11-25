from django.db import models
from users.models import CustomUser


class Package(models.Model):
    name = models.CharField(max_length=1024)
    default_users_count = models.IntegerField(default=0)
    default_month_count = models.IntegerField(default=0)
    start_cost = models.FloatField(default=0)
    cost_per_user = models.FloatField(default=0)
    active = models.BooleanField(default=False)

    def __unicode__(self):
        return self.name


class UserPackage(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_package_user_custom_user')
    package = models.ForeignKey('Package', related_name='user_package_package', blank=True, null=True)
    extension_of = models.ForeignKey('self', related_name='user_package_self', blank=True, null=True)
    additional_users = models.IntegerField(default=0)
    additional_months = models.IntegerField(default=0)

    def payments(self):
        return UserPayment.objects.filter(package=self)

    def __unicode__(self):
        return self.user.__unicode__()


class UserPayment(models.Model):
    package = models.ForeignKey('UserPackage', related_name='user_payment_package_user_package')
    date = models.DateTimeField(auto_now_add=True)
    sum = models.FloatField(default=0)
    payed = models.BooleanField(default=False)

    def __unicode__(self):
        return self.package.__unicode__()


class UserPackageAccess(models.Model):
    package = models.ForeignKey('UserPackage', related_name='user_package_access_user_package')
    user = models.ForeignKey(CustomUser, related_name='user_package_access_user_custom_user')

    def __unicode__(self):
        return self.package.__unicode__()
