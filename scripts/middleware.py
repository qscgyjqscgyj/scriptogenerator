import threading
import urllib
from django.utils.timezone import now
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.db.models.loading import get_model
from django.http import HttpResponseRedirect

from scripts.utils import get_params

_local_storage = threading.local()


def get_current_request():
    return getattr(_local_storage, "request", None)


class CurrentRequestMiddleware(object):
    def process_request(self, request):
        _local_storage.request = request


class SaveAnonymousUTMs(object):
    def process_request(self, request):
        if not '/admin' in request.build_absolute_uri():
            referer = request.META.get('HTTP_REFERER', None)
            utms = ''
            try:
                utms = referer.split('?')[1]
            except (IndexError, AttributeError) as e:
                referer = None
            if (referer and utms) and not '/r/' in referer:
                if not request.session.get('referer_utms'):
                    request.session['referer_utms'] = utms
            if request.GET:
                get_params = request.GET.urlencode()
                if not request.session.get('get_params_utms'):
                    request.session['get_params_utms'] = get_params


class SetLastVisitMiddleware(object):
    def process_response(self, request, response):
        try:
            if request.user.is_authenticated():
                # Update last visit time after request finished processing.
                get_model('users', 'CustomUser').objects.filter(pk=request.user.pk).update(last_visit=now())
        except AttributeError:
            return response
        return response
