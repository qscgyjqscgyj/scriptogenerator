# -*- coding: utf-8 -*-
from django.core.mail import EmailMultiAlternatives
from django.template import Context
from django.template.loader import get_template

from scripts.celery import app


@app.task
def send_new_user_data_email(email, password):
    subject, from_email = u'Вы зарегестрировались на сайте scriptogenerator.ru', 'info@scriptogenerator.ru'
    text_content = u'''
        Данные для входа в систему:\n
        Логин: %(login)s\n
        Пароль: %(password)s\n
        Для входа пройдите по ссылке: https://scriptogenerator.ru/accounts/login/
    ''' % dict(login=email, password=password)
    html_template = get_template('ext_register_email.html')
    msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
    msg.attach_alternative(html_template.render(Context({'login': email, 'password': password})), "text/html")
    return msg.send()
