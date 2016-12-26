# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_customuser_company'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='utm',
            field=models.TextField(null=True, blank=True),
        ),
    ]
