from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from payment.tasks import recount_balance
from users.models import CustomUser


class UserPayment(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_payment_user_custom_user')
    sum = models.FloatField(default=0)
    total_sum = models.FloatField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    payment_data = models.TextField(blank=True, null=True)
    payed = models.DateTimeField(blank=True, null=True)

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if not self.total_sum or self.total_sum < self.sum:
            self.total_sum = self.sum
        return super(UserPayment, self).save(force_insert=False, force_update=False, using=None, update_fields=None)

    def __unicode__(self):
        return self.user.__unicode__()


def recount_payment_user_balance(sender, instance, **kwargs):
    return recount_balance.delay()
post_save.connect(recount_payment_user_balance, sender=UserPayment)


class LocalPayment(models.Model):
    name = models.CharField(max_length=1024)
    user = models.ForeignKey(CustomUser, related_name='local_payment_user_custom_user')
    sum = models.FloatField(default=0.0)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.name
