# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.utils.translation import ugettext_lazy as _
from django.core import validators


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_auto_20161226_2149'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='username',
            field=models.CharField(_('username'), max_length=255, unique=True,
                help_text=_('Required. 255 characters or fewer. Letters, digits and '
                            '@/./+/-/_ only.'),
                validators=[
                    validators.RegexValidator(r'^[\w.@+-]+$',
                                              _('Enter a valid username. '
                                                'This value may contain only letters, numbers '
                                                'and @/./+/-/_ characters.'), 'invalid'),
                ],
                error_messages={
                    'unique': _("A user with that username already exists."),
            })
,
        ),
    ]
