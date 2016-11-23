from django.contrib import admin
from payment.models import *

admin.site.register(Package)
admin.site.register(UserPackage)
admin.site.register(UserPackageAccess)
admin.site.register(UserPayment)
