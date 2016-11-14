# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, View
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
import json

from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link, ScriptAccess
from main.serializers import ScriptSerializer, ProjectSerializer, TableSerializer, LinkCategorySerializer, \
    LinkSerializer, TableLinksCollSerializer, ScriptAccessSerializer
from scripts.settings import DEBUG
from scripts.utils import cloneTreeRelations
from users.models import CustomUser
from users.serializers import UserSerializer


class MainView(TemplateView):
    template_name = 'base.html'

    def get_context_data(self, **kwargs):
        context = super(MainView, self).get_context_data(**kwargs)
        context['DEBUG'] = DEBUG
        return context


class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


class ScriptsView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = ScriptSerializer(data=data)
        if script.is_valid():
            script.save()
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(script.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = ScriptSerializer(Script.objects.get(pk=int(data['id'])), data=data)
        if script.is_valid():
            script.save()
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(script.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            script = Script.objects.get(pk=int(data['id']))
            script.delete()
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class ProjectsView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        project = ProjectSerializer(data=data)
        if project.is_valid():
            project.save()
            return JSONResponse({
                'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(project.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        project = ProjectSerializer(Project.objects.get(pk=int(data['id'])), data=data)
        if project.is_valid():
            project.save()
            return JSONResponse({
                'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data,
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            }, status=201)
        return JSONResponse(project.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            project = Project.objects.get(pk=int(data['id']))
            project.delete()
            return JSONResponse({
                'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data,
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            }, status=201)
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class TablesView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'tables': TableSerializer(Table.objects.filter(script__pk=int(request.GET.get('id'))), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        table = TableSerializer(data=data)
        if table.is_valid():
            table.save()
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=data['script']), many=True).data
            })
        return JSONResponse(table.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        table = TableSerializer(Table.objects.get(pk=int(data['id'])), data=data)
        if table.is_valid():
            table.save()
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script__pk=int(data['script'])), many=True).data
            })
        return JSONResponse(table.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            table = Table.objects.get(pk=int(data['id']))
            table.delete()
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script__pk=int(data['script'])), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class CollsView(View):
    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        coll = TableLinksCollSerializer(data=data)
        coll_object = TableLinksColl.objects.get(pk=int(data['id']))
        if coll.is_valid():
            coll.update(coll_object, data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=coll_object.table.script), many=True).data
            })
        return JSONResponse(coll.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            coll = TableLinksColl.objects.get(pk=int(data['id']))
            coll.delete()
            table = Table.objects.get(pk=int(data['table']))
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=table.script), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class LinkCategoriesView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        coll = TableLinksColl.objects.get(pk=int(data['table']))
        category = LinkCategorySerializer(data=data)
        if category.is_valid():
            category.create(data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=coll.table.script), many=True).data
            })
        return JSONResponse(category.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        coll = TableLinksColl.objects.get(pk=int(data['table']))
        category = LinkCategorySerializer(data=data)
        if category.is_valid():
            category.update(LinkCategory.objects.get(pk=int(data['id'])), data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=coll.table.script), many=True).data
            })
        return JSONResponse(category.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            category = LinkCategory.objects.get(pk=int(data['category']))
            category.delete()
            table = Table.objects.get(pk=int(data['table']))
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=table.script), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class LinkView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        category = LinkCategory.objects.get(pk=int(data['category']))
        link = LinkSerializer(data=data)
        if link.is_valid():
            link.create(data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=category.table.table.script), many=True).data
            })
        return JSONResponse(category.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        category = LinkCategory.objects.get(pk=int(data['category']))
        link = LinkSerializer(data=data)
        if link.is_valid():
            link.update(Link.objects.get(pk=int(data['id'])), data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=category.table.table.script), many=True).data
            })
        return JSONResponse(category.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            link = Link.objects.get(pk=int(data['link']))
            link.delete()
            table = Table.objects.get(pk=int(data['table']))
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=table.script), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class ScriptAccessView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        accesses = data['accesses']
        script = Script.objects.get(pk=int(data['script']['id']))

        def delete_accesses(accesses_for_deleting):
            for access in accesses_for_deleting:
                access.delete()

        if accesses:
            created_accesses = []
            for access in accesses:
                user = CustomUser.objects.get(pk=int(access['user_id']))
                try:
                    created_access = ScriptAccess.objects.get(user=user, script=script)
                    created_access.edit = access['edit']
                except ObjectDoesNotExist:
                    created_access = ScriptAccess.objects.create(user=user, script=script, edit=access['edit'])
                created_access.save()
                created_accesses.append(created_access.pk)
                if created_accesses:
                    delete_accesses(script.accesses().exclude(pk__in=created_accesses))
        else:
            delete_accesses(script.accesses())
        return JSONResponse({
            'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
        })


class CloneScriptView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        currentScript = Script.objects.get(pk=int(data['id']))
        script = Script.objects.get(pk=int(data['id']))
        script.pk = None
        script.name += u' (копия)'
        script.save()
        cloneTreeRelations(currentScript.pk, script.pk, 'main', 'Script')

        for link in script.links():
            link.clone_save()

        return JSONResponse({
            'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
        })


class InitView(View):
    def get(self, request, *args, **kwargs):
        access_scripts_ids = []
        for access in ScriptAccess.objects.filter(user=request.user):
            access_scripts_ids.append(access.script.pk)
        return JSONResponse({
            'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data,
            'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data,
            'available_scripts': ScriptSerializer(Script.objects.filter(pk__in=access_scripts_ids), many=True).data,
            'users': UserSerializer(CustomUser.objects.all().exclude(pk=request.user.pk), many=True).data,
            'session_user': UserSerializer(request.user).data
        }, status=201)

