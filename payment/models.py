from django.db import models
from users.models import CustomUser


class UserPayment(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_payment_user_custom_user')
    sum = models.FloatField(default=0)
    total_sum = models.FloatField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    payment_data = models.TextField(blank=True, null=True)
    payed = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return self.user.__unicode__()


class LocalPayment(models.Model):
    name = models.CharField(max_length=1024)
    user = models.ForeignKey(CustomUser, related_name='local_payment_user_custom_user')
    sum = models.FloatField(default=0.0)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.name
