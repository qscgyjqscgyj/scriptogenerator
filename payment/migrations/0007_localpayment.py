# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payment', '0006_userpayment_total_sum'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocalPayment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('sum', models.FloatField(default=0.0)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(related_name='local_payment_user_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
