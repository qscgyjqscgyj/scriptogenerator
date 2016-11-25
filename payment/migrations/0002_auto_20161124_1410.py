# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='package',
            name='cost_per_month',
        ),
        migrations.AddField(
            model_name='userpackage',
            name='extension_of',
            field=models.ForeignKey(related_name='user_package_self', blank=True, to='payment.UserPackage', null=True),
        ),
        migrations.AlterField(
            model_name='userpackage',
            name='package',
            field=models.ForeignKey(related_name='user_package_package', blank=True, to='payment.Package', null=True),
        ),
    ]
