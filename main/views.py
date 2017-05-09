# -*- coding: utf-8 -*-
import datetime

from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.core.paginator import EmptyPage
from django.core.paginator import PageNotAnInteger
from django.core.paginator import Paginator
from django.db.models.loading import get_model
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.views.generic import TemplateView, View
from rest_framework.renderers import JSONRenderer
import json

from main.events import take_presents_to_user
from main.models import Script, Table, TableLinksColl, LinkCategory, Link, ScriptAccess, ScriptData
from main.serializers.link import LinkCategorySerializer, LinkSerializer
from main.serializers.script import ScriptSerializer
from main.serializers.table import TableSerializer, TableLinksCollSerializer
from main.utils import create_active_user, get_empty_table, get_empty_coll, get_empty_category, get_empty_link
from scripts.settings import DEBUG, YANDEX_SHOPID, YANDEX_SCID
from scripts.tasks import clone_script_with_relations
from users.models import CustomUser, UserAccess
from users.serializers import UserSerializer, UserAccessSerializer


class MainView(TemplateView):
    template_name = 'base.html'

    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated():
            return super(MainView, self).get(*args, **kwargs)
        # return HttpResponseRedirect('http://lp.scriptogenerator.ru/')
        return HttpResponseRedirect('http://getproff.ru/scriptogenerator')

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
    http_method_names = ['get', 'post', 'put', 'delete']

    def user_accessable_scripts_ids(self, request):
        access_scripts_ids = []
        for access in ScriptAccess.objects.filter(user=request.user):
            access_scripts_ids.append(access.script.pk)
        return access_scripts_ids

    def get(self, request, *args, **kwargs):
        if not request.GET.get('available_scripts'):
            scripts = ScriptSerializer(Script.objects.filter(owner=request.user), many=True, empty_data=True).data
        else:
            scripts = ScriptSerializer(Script.objects.filter(pk__in=self.user_accessable_scripts_ids(request)), many=True).data

        paginator = Paginator(scripts, 20)
        page = request.GET.get('page')

        try:
            scripts = paginator.page(page)
        except PageNotAnInteger:
            scripts = paginator.page(1)
        except EmptyPage:
            scripts = paginator.page(paginator.num_pages)

        return JSONResponse({
            'scripts': scripts.object_list,
            'page': page,
            'next_page': scripts.has_next()
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = ScriptSerializer(data=data)
        if script.is_valid():
            script.create(data)
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True, empty_data=True).data,
                'session_user': UserSerializer(CustomUser.objects.get(pk=request.user.pk)).data
            })
        return JSONResponse(script.errors, status=400)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        current_script = Script.objects.get(pk=int(data['id']))
        script = ScriptSerializer(current_script, data=data)
        if script.is_valid():
            script.update(current_script, data)
            return JSONResponse({
                'script': ScriptSerializer(current_script).data
            })
        return JSONResponse(script.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        try:
            script = Script.objects.get(pk=int(data['id']))
            script.delete()
            return JSONResponse({
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True, empty_data=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'error': 'Object does not exist.'}, status=400)


class ScriptView(ScriptsView):
    http_method_names = ['get']

    def get(self, request, *args, **kwargs):
        script = Script.objects.get(pk=int(request.GET['script']))
        if not script.owner == request.user:
            if int(request.GET['script']) in self.user_accessable_scripts_ids(request):
                return JSONResponse({
                    'script': ScriptSerializer(script).data
                })
            else:
                return JSONResponse({'error': 'This scripts is not available for you.'}, status=403)
        else:
            return JSONResponse({
                'script': ScriptSerializer(script).data
            })


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
                'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True, empty_data=True).data
            })
        except ObjectDoesNotExist:
            return JSONResponse({'message': 'User does not exist.'}, status=400)


class TablesView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({
            'tables': TableSerializer(Table.objects.filter(script__pk=int(request.GET.get('id'))), many=True).data
        })

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        script_data_object, created = ScriptData.objects.get_or_create(script=script)
        script_data = json.loads(script_data_object.data)
        script_data.append(get_empty_table())
        script_data_object.data = json.dumps(script_data)
        script_data_object.save()
        return JSONResponse({
            'data': json.loads(script.data())
        })

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        current_table = script.tables(table_id=data['table']['id'])
        new_table = TableSerializer(data=data['table'])
        if new_table.is_valid():
            script.replace_table(data['table'], current_table['index'])
            return JSONResponse({
                'data': json.loads(script.data())
            })
        else:
            return JSONResponse(new_table.errors, status=500)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        script_data_object = ScriptData.objects.get(script=script)
        script_data = json.loads(script_data_object.data)
        script_data.remove(script.tables(table_id=int(data['table']))['data'])
        script_data_object.data = json.dumps(script_data)
        script_data_object.save()
        return JSONResponse({
            'data': json.loads(script.data())
        })


class CollsView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table_data = script.tables(table_id=data['table'])
        new_coll = get_empty_coll()
        table_data['data']['colls'].append(new_coll)
        script.replace_table(table_data['data'], table_data['index'])
        return JSONResponse({
            'data': json.loads(script.data()),
            'new_coll': new_coll
        })

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table = script.tables(table_id=data['table'])
        current_coll = script.colls(table_id=data['table'], coll_id=data['coll']['id'])
        new_coll = TableLinksCollSerializer(data=data['coll'])
        if new_coll.is_valid():
            table['data']['colls'][current_coll['index']] = new_coll.validated_data
            script.replace_table(table['data'], table['index'])
            return JSONResponse({
                'data': json.loads(script.data())
            })
        return JSONResponse(new_coll.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table_data = script.tables(table_id=data['table'])
        coll_data = script.colls(table_id=data['table'], coll_id=data['coll'])
        if coll_data:
            table_data['data']['colls'].remove(coll_data['data'])
            script.replace_table(table_data['data'], table_data['index'])
            return JSONResponse({
                'data': json.loads(script.data())
            })
        return JSONResponse({'error': 'Coll doesn\'t exist'}, status=400)


class LinkCategoriesView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table_data = script.tables(table_id=data['table'])
        coll_data = script.colls(table_id=data['table'], coll_id=data['coll'])
        new_category = get_empty_category(data['hidden'])
        coll_data['data']['categories'].append(new_category)
        table_data['data']['colls'][coll_data['index']] = coll_data['data']
        script.replace_table(table_data['data'], table_data['index'])
        return JSONResponse({
            'category': new_category
        })

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table = script.tables(table_id=data['table'])
        coll = script.colls(table_id=data['table'], coll_id=data['coll'])
        current_category = script.categories(table_id=data['table'], coll_id=data['coll'], category_id=data['category']['id'])
        new_category = LinkCategorySerializer(data=data['category'])
        if new_category.is_valid():
            table['data']['colls'][coll['index']]['categories'][current_category['index']] = new_category.validated_data
            script.replace_table(table['data'], table['index'])
            return JSONResponse({
                'data': json.loads(script.data())
            })
        return JSONResponse(new_category.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table = script.tables(table_id=data['table'])
        coll = script.colls(table_id=data['table'], coll_id=data['coll'])
        current_category = script.categories(table_id=data['table'], coll_id=data['coll'], category_id=data['category'])
        if current_category:
            table['data']['colls'][coll['index']]['categories'].remove(current_category['data'])
            script.replace_table(table['data'], table['index'])
            return JSONResponse({
                'status': 'success'
            })
        return JSONResponse({'error': 'Category doesn\'t exist'}, status=400)


class LinkView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table_data = script.tables(table_id=data['table'])
        coll_data = script.colls(table_id=data['table'], coll_id=data['coll'])
        category_data = script.categories(table_id=data['table'], coll_id=data['coll'], category_id=data['category'])
        new_link = get_empty_link(to_link=data['to_link'])
        category_data['data']['links'].append(new_link)
        coll_data['data']['categories'][category_data['index']] = category_data['data']
        table_data['data']['colls'][coll_data['index']] = coll_data['data']
        script.replace_table(table_data['data'], table_data['index'])
        return JSONResponse({
            'link': new_link
        })

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table = script.tables(table_id=data['table'])
        coll = script.colls(table_id=data['table'], coll_id=data['coll'])
        category = script.categories(table_id=data['table'], coll_id=data['coll'], category_id=data['category'])
        current_link = script.links(table_id=data['table'], coll_id=data['coll'], category_id=data['category'], link_id=data['link']['id'])
        new_link = LinkSerializer(data=data['link'])
        if new_link.is_valid():
            table['data']['colls'][coll['index']]['categories'][category['index']]['links'][current_link['index']] = new_link.validated_data
            script.replace_table(table['data'], table['index'])
            return JSONResponse({
                'data': json.loads(script.data())
            })
        return JSONResponse(new_link.errors, status=400)

    def delete(self, request, *args, **kwargs):
        data = json.loads(request.body)
        script = Script.objects.get(pk=int(data['script']))
        table = script.tables(table_id=data['table'])
        coll = script.colls(table_id=data['table'], coll_id=data['coll'])
        category = script.categories(table_id=data['table'], coll_id=data['coll'], category_id=data['category'])
        current_link = script.links(table_id=data['table'], coll_id=data['coll'], category_id=data['category'], link_id=data['link'])
        if current_link:
            table['data']['colls'][coll['index']]['categories'][category['index']]['links'].remove(current_link['data'])
            script.replace_table(table['data'], table['index'])
            return JSONResponse({
                'status': 'success'
            })
        return JSONResponse({'error': 'Link doesn\'t exist'}, status=400)


class ScriptAccessView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        accesses = data['accesses']
        script = Script.objects.get(pk=int(data['script_id']))

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
            'data': json.loads(script.data())
        })


class CloneScriptView(View):
    def post(self, request, *args, **kwargs):
        current_script = Script.objects.get(pk=int(request.POST.get('script')))
        clone_script_with_relations(current_script.pk, [('name', current_script.name + u'  (копия)')])
        return JSONResponse({
            'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True, empty_data=True).data
        })


class InitView(ScriptsView):
    http_method_names = ['get']

    def get(self, request, *args, **kwargs):
        available_scripts = Script.objects.filter(pk__in=self.user_accessable_scripts_ids(request))
        return JSONResponse({
            'scripts': ScriptSerializer(Script.objects.filter(owner=request.user), many=True, empty_data=True).data,
            'template_scripts': ScriptSerializer(Script.objects.filter(is_template=True), many=True, empty_data=True).data,
            'available_scripts': ScriptSerializer(available_scripts, many=True).data,
            'session_user': UserSerializer(request.user).data,
            'shopId': YANDEX_SHOPID,
            'scid': YANDEX_SCID,
        }, status=200)


class ExternalRegisterView(View):
    def get(self, request, *args, **kwargs):
        email = request.GET.get('email')
        if email:
            active_user = create_active_user(request=request, email=email, first_name=request.GET.get('first_name'), phone=request.GET.get('phone'))
            if not active_user:
                return HttpResponseRedirect('/')
            user = active_user['user']
            password = active_user['password']
            if user:
                if request.GET.get('balance') == '1':
                    take_presents_to_user(user)

                login(request, authenticate(
                    username=user.username,
                    password=password
                ))

                if request.GET.get('type') == 'ext':
                    return HttpResponseRedirect('/')

                return JsonResponse({'success': 200}, status=200)
        return JsonResponse({'error': 500, 'message': u'User with same email already exist.'}, status=500)

    def post(self, request, *args, **kwargs):
        return JsonResponse({'error': 'Method doesn\'t supports.'}, status=500)


EXT_PAYMENT_TITLES = {
    'SG_PAY_1000': 1000.0,
    'SG_PAY_3000': 3000.0,
    'SG_PAY_5000': 7000.0,
    'SG_PAY_YEAR': 15000.0
}


class ExternalPaymentView(View):
    def get(self, request, *args, **kwargs):
        send_mail('ExternalPaymentView.get', str(dict(request.GET)), 'info@scriptogenerator.ru', ['aliestarten@gmail.com', 'sky-life@inbox.ru'])
        email = request.GET.get('email')
        if email:
            try:
                user = CustomUser.objects.get(username=email)
                product_title = request.GET.get('product_title')
                if product_title:
                    try:
                        take_presents_to_user(
                            user,
                            EXT_PAYMENT_TITLES[product_title],
                            u'Оплата пакета: ' + product_title,
                            present_script=False,
                            promotion=True if product_title == 'SG_PAY_YEAR' else False
                        )
                        if request.GET.get('type') == 'ext':
                            return HttpResponseRedirect('/')
                    except KeyError:
                        return JsonResponse({'error': 500, 'message': u'Package does not exist.'}, status=500)
                else:
                    return JsonResponse({'error': 500, 'message': u'Argument project_title does not exist.'}, status=500)
            except ObjectDoesNotExist:
                return JsonResponse({'error': 500, 'message': u'User with same email does not exist.'}, status=500)
        return JsonResponse({'error': 500, 'message': u'User with same email already exist.'}, status=500)

    def post(self, request, *args, **kwargs):
        return JsonResponse({'error': 'Method doesn\'t supports.'}, status=500)
