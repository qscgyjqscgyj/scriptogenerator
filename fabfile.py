# -*- coding: utf-8 -*-
import datetime
from fabric.api import env, cd, run, prefix, sudo
from fabric.operations import local
from scripts.settings import LOCAL_APPS

env.hosts = ['root@alpateks.ru:22']
# local_prefix = prefix('source /home/aliestarten/Env/scripts/bin/activate')
server_prefix = prefix('source /home/Env/scripts/bin/activate')


def deploy():
    with cd('/home/Django/scripts'):
        try:
            # local('gulp build --production')
            local('git add .')
            local('git commit -a -m "deploy: %s"' % datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            local('git push origin master')
        except Exception as e:
            print(e)
        with server_prefix:
            run('git pull')
            run('pip install -r requirements/development.pip')
            run('python ./manage.py syncdb')
            run('python ./manage.py makemigrations --merge')
            run('python ./manage.py migrate')
            run('python ./manage.py collectstatic --noinput')
            sudo('service nginx restart')
            sudo('supervisorctl restart scripts scripts.celery')


def manage(command='help'):
    with cd('/home/Django/scripts'):
        with prefix:
            run('python ./manage.py %s' % command)


def migrate():
    try:
        local('python manage.py makemigrations')
    except :
        pass
    local('python manage.py migrate', capture=False)


def syncdb():
    local('python manage.py syncdb')


def runserver():
    local('gulp watch --dev')
    local('python manage.py runserver')
