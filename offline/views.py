# -*- coding: utf-8 -*-
import StringIO
import base64
import json

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.views.generic import View

from main.views import JSONResponse
from offline.serializers import UserOfflineExportedScriptSerializer
from payment.models import UserOfflineScriptExportAccess
from scripts.settings import PROJECT_PATH


class OfflineScriptExportView(View):
    def get(self, request, *args, **kwargs):
        try:
            offline_script_export = UserOfflineScriptExportAccess.objects.get(pk=int(kwargs['offline_script_export']), script_data__isnull=False, exported=True)
            if request.user == offline_script_export.user:
                context = {}

                context['script'] = json.loads(offline_script_export.script_data)

                made_in_scriptogenerator_logo_path = '%(PROJECT_PATH)s/offline/static/img/logo-made-in-scriptogenerator.png' % dict(PROJECT_PATH=PROJECT_PATH)
                made_in_scriptogenerator_logo = open(made_in_scriptogenerator_logo_path, "rb")
                made_in_scriptogenerator_logo_base64 = base64.b64encode(made_in_scriptogenerator_logo.read())
                context['made_in_scriptogenerator_logo'] = made_in_scriptogenerator_logo_base64

                rendered_offline_script_template = render_to_string('offline_script.html', context).encode('utf-8')

                file_name = 'script_%(script_id)s.html' % dict(script_id=str(offline_script_export.script.pk))
                offline_script_file = StringIO.StringIO()
                offline_script_file.write(rendered_offline_script_template)
                offline_script_file.flush()

                response = HttpResponse(offline_script_file.getvalue(), content_type='application/zip')
                response['Content-Disposition'] = 'attachment; filename=%(file_name)s' % dict(file_name=file_name)
                return response
            raise Http404
        except ObjectDoesNotExist:
            raise Http404


class OfflineExportedScripts(View):
    def get(self, request, *args, **kwargs):
        offline_exported_scripts = UserOfflineScriptExportAccess.objects.filter(user=request.user, script_data__isnull=False, exported=True)
        return JSONResponse({
            'offline_exported_scripts': UserOfflineExportedScriptSerializer(offline_exported_scripts, many=True).data
        })

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        offline_exported_script = UserOfflineScriptExportAccess.objects.get(pk=int(data.get('script_access_id')))
        actual_user_offline_script_export_access = UserOfflineScriptExportAccess.objects.get_actual_user_offline_script_export_access(request.user)
        if actual_user_offline_script_export_access and offline_exported_script.exported and offline_exported_script.script:
            offline_exported_script.update_offline_script_data()
            offline_exported_scripts = UserOfflineScriptExportAccess.objects.filter(user=request.user, script_data__isnull=False, exported=True)
            return JSONResponse({
                'offline_exported_scripts': UserOfflineExportedScriptSerializer(offline_exported_scripts, many=True).data
            })
        return JSONResponse({'message': 'Script export cannot be updated'}, status=500)
