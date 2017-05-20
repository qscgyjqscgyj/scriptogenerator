# -*- coding: utf-8 -*-
# Global settings for scripts project.

from os.path import abspath, dirname, basename, join, split
import djcelery
djcelery.setup_loader()

MAIN_APPS_PATH = abspath(dirname(__file__))
MAIN_APPS_NAME = basename(MAIN_APPS_PATH)
PROJECT_PATH = split(MAIN_APPS_PATH)[0]
PROJECT_NAME = basename(PROJECT_PATH)

FILE_UPLOAD_PERMISSIONS = 0644

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.',
        'NAME': '',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
        }
}

TIME_ZONE = 'Asia/Krasnoyarsk'
LANGUAGE_CODE = 'RU-ru'
USE_I18N = True
USE_L10N = True

BROKER_URL = 'amqp://scripts:scripts@localhost:5672/scripts'
CELERY_RESULT_BACKEND = 'amqp'
CELERY_RESULT_PERSISTENT = True
CELERY_AMQP_TASK_RESULT_EXPIRES = 18000

CELERY_TIMEZONE = TIME_ZONE
CELERYD_STATE_DB = join(PROJECT_PATH, 'celery_state')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_IGNORE_RESULT = False
CELERYBEAT_SCHEDULER = 'djcelery.schedulers.DatabaseScheduler'
CELERY_IMPORTS = ('scripts.tasks', 'payment.tasks', 'main.tasks')

STATIC_ROOT = join(PROJECT_PATH, 'static')
STATIC_URL = '/static/'
ADMIN_MEDIA_PREFIX = STATIC_URL
MEDIA_ROOT = join(PROJECT_PATH, 'media')
MEDIA_URL = '/media/'
STATICFILES_DIRS = ()
TEMPLATE_DIRS = ()

COMPRESS_ENABLED = True
# COMPRESS_OFFLINE = True

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder'
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'scripts.middleware.SaveAnonymousUTMs',
    'scripts.middleware.SetLastVisitMiddleware'
)

ANONYMOUS_USER_ID = -1
SITE_ID = 1
SECRET_KEY = '6r__$4@+m40l_h1#76i6n9(nqv2$cb7##915o%=v6@x6gq&kx_'
ROOT_URLCONF = 'scripts.urls'
WSGI_APPLICATION = 'scripts.wsgi.application'

AUTH_USER_MODEL = 'users.CustomUser'

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
)


INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'rest_framework',
    'registration',
    'djcelery',
    'kombu.transport.django',
    'constance',
    'constance.backends.database',
    'compressor'
)

LOCAL_APPS = (
    'main',
    'payment',
    'users',
    'offline'
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp-pulse.com'
EMAIL_PORT = 2525
EMAIL_HOST_USER = 'skyliffer@yandex.ru'
EMAIL_HOST_PASSWORD = 'GDSdMfoLtKB'
DEFAULT_FROM_EMAIL = 'info@scriptogenerator.ru'
SERVER_EMAIL = 'info@scriptogenerator.ru'

SEND_ACTIVATION_EMAIL = True
ACCOUNT_ACTIVATION_DAYS = 10
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

REGISTRATION_FORM = 'users.forms.CustomRegistrationForm'
LOGIN_REDIRECT_URL = '/'

CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
CONSTANCE_IGNORE_ADMIN_VERSION_CHECK = True
CONSTANCE_CONFIG = {
    'PAYMENT_PER_DAY': (15.0, u'Абонентская плата за день', float),
    'PAYMENT_PER_USER': (15.0, u'Абонентская плата за КАЖДОГО пользователя', float),

    'ADVERTISING_TITLE': (u'Акция', u'Название акции', str),
    'ADVERTISING_URL': (u'Ссылка', u'Ссылка на акцию', str),
}

YANDEX_SHOPID = '91593'
YANDEX_SCID = '85481'
YANDEX_SHOPPASSWORD = 'K5e4RU8824ZetzjCnQVd'

for item in LOCAL_APPS:
    INSTALLED_APPS+=(item,)
    TEMPLATE_DIRS+=(join(PROJECT_PATH, item,'templates'),)
    STATICFILES_DIRS+=((item,join(PROJECT_PATH, item,'static')),)

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 5
}

from local import *
