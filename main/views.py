# -*- coding: utf-8 -*-
import datetime

from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.db.models.loading import get_model
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.views.generic import TemplateView, View
from rest_framework.renderers import JSONRenderer
import json

from main.events import take_presents_to_user
from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link, ScriptAccess
from main.serializers.link import LinkCategorySerializer, LinkSerializer
from main.serializers.project import ProjectSerializer
from main.serializers.script import ScriptSerializer
from main.serializers.table import TableSerializer, TableLinksCollSerializer
from main.utils import create_active_user
from scripts.settings import DEBUG, YANDEX_SHOPID, YANDEX_SCID
from scripts.tasks import cloneTreeRelations, clone_save_links
from users.models import CustomUser, UserAccess
from users.serializers import UserSerializer, UserAccessSerializer


class MainView(TemplateView):
    template_name = 'base.html'

    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(MainView, self).get(*args, **kwargs)
        return HttpResponseRedirect('http://lp.scriptogenerator.ru/')

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
            script.create(data)
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(script.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        current_script = Script.objects.get(pk=int(data['id']))
        script = ScriptSerializer(current_script, data=data)
        if script.is_valid():
            script.update(current_script, data)
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


class DelegateScriptView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = data['script']
        new_owner_email = data['email']
        try:
            user = CustomUser.objects.get(username=new_owner_email)
            script = Script.objects.get(pk=int(script['id']))
            script.owner = user
            script.save()
            for access in script.accesses():
                access.delete()
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'message': 'User does not exist.'}, status=400)


class ProjectsView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        project = ProjectSerializer(data=data)
        if project.is_valid():
            project.create(data)
            return JSONResponse({
                'projects': ProjectSerializer(Project.objects.filter(owner=request.user), many=True).data
            })
        return JSONResponse(project.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        current_project = Project.objects.get(pk=int(data['id']))
        project = ProjectSerializer(current_project, data=data)
        if project.is_valid():
            project.update(current_project, data)

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
            table.create(data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=data['script']), many=True).data
            })
        return JSONResponse(table.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        current_table = Table.objects.get(pk=int(data['id']))
        table = TableSerializer(current_table, data=data)
        if table.is_valid():
            table.update(current_table, data)
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

        # if data.get('opened_category') or data.get('opened_link'):
        #     for category in data['coll']['categories']:
        #         category['opened'] = not data['opened_category']['opened'] if data.get('opened_category') and data['opened_category']['id'] == category['id'] else None
        #         for link in category['links']:
        #             link['opened'] = not data['opened_link']['opened'] if data.get('opened_link') and data['opened_link']['id'] == link['id'] else None

        coll = TableLinksCollSerializer(data=data['coll'])
        coll_object = TableLinksColl.objects.get(pk=int(data['coll']['id']))
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
        return JSONResponse(link.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        category = LinkCategory.objects.get(pk=int(data['category']))
        link = LinkSerializer(data=data)
        if link.is_valid():
            link.update(Link.objects.get(pk=int(data['id'])), data)
            return JSONResponse({
                'tables': TableSerializer(Table.objects.filter(script=category.table.table.script), many=True).data
            })
        return JSONResponse(link.errors, status=400)

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
        current_script = Script.objects.get(pk=int(data['id']))
        current_script_links_count = len(current_script.links())

        clone_script = Script.objects.get(pk=int(data['id']))
        clone_script.pk = None
        clone_script.name += u' (копия)'
        clone_script.active = False
        clone_script.save()
        cloneTreeRelations.delay(current_script.pk, clone_script.pk, 'main', 'Script')
        clone_save_links.delay(clone_script.pk, current_script_links_count)
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
            'template_scripts': ScriptSerializer(Script.objects.filter(is_template=True), many=True).data,
            'available_scripts': ScriptSerializer(Script.objects.filter(pk__in=access_scripts_ids), many=True).data,
            'users': UserSerializer(CustomUser.objects.all().exclude(pk=request.user.pk), many=True).data,
            'session_user': UserSerializer(request.user).data,
            'team': UserAccessSerializer(UserAccess.objects.filter(owner=request.user), many=True).data,
            'shopId': YANDEX_SHOPID,
            'scid': YANDEX_SCID,
        }, status=201)


class ExternalRegisterView(View):
    def get(self, request, *args, **kwargs):
        email = request.GET.get('email')
        if email:
            active_user = create_active_user(
                request=request,
                email=email,
                first_name=request.GET.get('first_name'),
                phone=request.GET.get('phone')
            )
            if active_user:
                user = active_user['user']
                password = active_user['password']
                if user:
                    if request.GET.get('balance') == '1':
                        take_presents_to_user(user)

                        login(request, authenticate(
                            username=user.username,
                            password=password
                        ))
                    return JsonResponse({'success': 200}, status=200)
            else:
                return JsonResponse({'error': 500, 'message': u'Integrity error.'}, status=500)
            return JsonResponse({'error': 500, 'message': u'User with same email already exist.'}, status=500)

    def post(self, request, *args, **kwargs):
        return JsonResponse({'error': 'Method doesn\'t supports.'}, status=500)
