from django.db import models
from users.models import CustomUser


class Balance(models.Model):
    user = models.ForeignKey(CustomUser, related_name='balance_user_custom_user')
    total = models.FloatField(default=0.0)
    current = models.FloatField(default=0.0)

    def __unicode__(self):
        return self.user.__unicode__()


class Bonus(models.Model):
    sum = models.FloatField(default=0.0)
    bonus = models.FloatField(default=0.0)

    def __unicode__(self):
        return self.sum


class UserPayment(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_payment_user_custom_user')
    payed = models.DateTimeField(blank=True, null=True)
    sum = models.FloatField(default=0)

    def __unicode__(self):
        return self.package.__unicode__()
