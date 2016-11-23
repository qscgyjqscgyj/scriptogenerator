# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Package',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('start_cost', models.FloatField(default=0)),
                ('cost_per_user', models.FloatField(default=0)),
                ('cost_per_month', models.FloatField(default=0)),
                ('default_users_count', models.IntegerField(default=0)),
                ('default_month_count', models.IntegerField(default=0)),
                ('active', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='UserPackage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('additional_users', models.IntegerField(default=0)),
                ('additional_months', models.IntegerField(default=0)),
                ('package', models.ForeignKey(related_name='user_package_package', to='payment.Package')),
                ('user', models.ForeignKey(related_name='user_package_user_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserPackageAccess',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('package', models.ForeignKey(related_name='user_package_access_user_package', to='payment.UserPackage')),
                ('user', models.ForeignKey(related_name='user_package_access_user_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserPayment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('sum', models.FloatField(default=0)),
                ('payed', models.BooleanField(default=False)),
                ('package', models.ForeignKey(related_name='user_payment_package_user_package', to='payment.UserPackage')),
            ],
        ),
    ]
