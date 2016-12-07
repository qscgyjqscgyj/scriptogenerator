# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payment', '0003_auto_20161128_1629'),
    ]

    operations = [
        migrations.CreateModel(
            name='Balance',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('total', models.FloatField(default=0.0)),
                ('current', models.FloatField(default=0.0)),
                ('user', models.ForeignKey(related_name='balance_user_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Bonus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('sum', models.FloatField(default=0.0)),
                ('bonus', models.FloatField(default=0.0)),
            ],
        ),
        migrations.RemoveField(
            model_name='userpackage',
            name='extension_of',
        ),
        migrations.RemoveField(
            model_name='userpackage',
            name='package',
        ),
        migrations.RemoveField(
            model_name='userpackage',
            name='user',
        ),
        migrations.RemoveField(
            model_name='userpackageaccess',
            name='package',
        ),
        migrations.RemoveField(
            model_name='userpackageaccess',
            name='user',
        ),
        migrations.RemoveField(
            model_name='userpayment',
            name='additional_months',
        ),
        migrations.RemoveField(
            model_name='userpayment',
            name='additional_users',
        ),
        migrations.RemoveField(
            model_name='userpayment',
            name='date',
        ),
        migrations.RemoveField(
            model_name='userpayment',
            name='package',
        ),
        migrations.AddField(
            model_name='userpayment',
            name='user',
            field=models.ForeignKey(related_name='user_payment_user_custom_user', default=1,
                                    to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='userpayment',
            name='payed',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.DeleteModel(
            name='Package',
        ),
        migrations.DeleteModel(
            name='UserPackage',
        ),
        migrations.DeleteModel(
            name='UserPackageAccess',
        ),
    ]
