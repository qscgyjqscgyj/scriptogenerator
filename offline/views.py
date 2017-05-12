from django.shortcuts import render
from django.template.response import TemplateResponse
from django.views.generic import View
import json

from main.models import Script
from main.serializers.script import ScriptSerializer
from scripts.utils import datetime_handler


class OfflineScriptView(View):
    def get(self, request, *args, **kwargs):
        context = {}
        script = Script.objects.get(pk=int(kwargs['script']))
        script_json = ScriptSerializer(script).data
        context['script'] = json.dumps(script_json, default=datetime_handler)
        return TemplateResponse(request, 'offline_script.html', context)
