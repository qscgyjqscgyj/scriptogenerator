# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, View
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
import json

from main.models import Script, Project
from main.serializers import ScriptSerializer, ProjectSerializer


class MainView(TemplateView):
    template_name = 'base.html'


class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


class ScriptsView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse(ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data)

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = ScriptSerializer(data=data)
        if script.is_valid():
            script.save()
            return JSONResponse(ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data, status=201)
        return JSONResponse(script.errors, status=400)


class ProjectsView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse(ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data)

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        project = ProjectSerializer(data=data)
        if project.is_valid():
            project.save()
            return JSONResponse(ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data, status=201)
        return JSONResponse(project.errors, status=400)
