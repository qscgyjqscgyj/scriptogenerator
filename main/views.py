# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, View
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer

from main.models import Script
from main.serializers import ScriptSerializer


class MainView(TemplateView):
    template_name = 'base.html'


class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


class ScriptsView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse(ScriptSerializer(Script.objects.all(), many=True).data)

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        script = ScriptSerializer(data)
        if script.is_valid():
            script.save()
            return JSONResponse(ScriptSerializer(Script.objects.all(), many=True).data, status=201)
        return JSONResponse(script.errors, status=400)
