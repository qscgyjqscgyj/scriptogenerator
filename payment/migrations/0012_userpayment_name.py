# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0011_auto_20170523_1426'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpayment',
            name='name',
            field=models.CharField(default=b'\xd0\x9f\xd0\xbe\xd0\xbf\xd0\xbe\xd0\xbb\xd0\xbd\xd0\xb5\xd0\xbd\xd0\xb8\xd0\xb5 \xd1\x81\xd1\x87\xd0\xb5\xd1\x82\xd0\xb0', max_length=1024),
        ),
    ]
