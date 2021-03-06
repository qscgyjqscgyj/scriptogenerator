# -*- coding: utf-8 -*-
import datetime
from fabric.api import env, cd, run, prefix, sudo
from fabric.operations import local
from scripts.settings import LOCAL_APPS

env.hosts = ['root@scriptogenerator.ru:22']
server_prefix = prefix('source /home/Env/scripts/bin/activate')
server_project_dir = '/home/Django/scripts'


def deploy():
    with cd(server_project_dir):
        try:
            local('git add .')
            local('git commit -a -m "deploy: %s"' % datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            local('git push origin master')
        except Exception as e:
            print(e)
        with server_prefix:
            run('git pull origin master')
            run('pip install -r requirements/development.pip')
            run('python ./manage.py syncdb')
            run('python ./manage.py makemigrations --merge')
            run('python ./manage.py migrate')
            run('python ./manage.py collectstatic --noinput')
            sudo('service nginx restart')
            sudo('supervisorctl restart scripts')
            sudo('supervisorctl restart scripts.celeryd')
            sudo('supervisorctl restart scripts.celerybeat')


def restart_celery():
    with server_prefix:
        sudo('supervisorctl restart scripts.celery')


def kill_celery():
    with server_prefix:
        sudo("ps auxww | grep 'celeryd' | awk '{print $2}' | xargs kill -9")
        sudo("ps auxww | grep 'celerybeat' | awk '{print $2}' | xargs kill -9")


def manage(command='help'):
    with cd(server_project_dir):
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
