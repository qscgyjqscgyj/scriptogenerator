from rest_framework import serializers

from main.serializers.fields import DateTimeField
from payment.models import UserPayment, LocalPayment, PaymentLog, UserScriptDelegationAccess, \
    UserOfflineScriptExportAccess
from users.models import CustomUser


class ExportedScriptField(serializers.Field):
    def to_representation(self, offline_exported_script):
        if offline_exported_script.script_data and offline_exported_script.script and offline_exported_script.exported:
            return {
                'id': offline_exported_script.script.id,
                'name': offline_exported_script.script.name
            }

    def get_attribute(self, script):
        return script

    def to_internal_value(self, script):
        return script


class UserOfflineExportedScriptSerializer(serializers.ModelSerializer):
    date = DateTimeField(required=False, read_only=True)
    payed = DateTimeField(required=False, read_only=True)
    exported_date = DateTimeField(required=False, read_only=True)
    script = ExportedScriptField(required=False, read_only=True)

    class Meta:
        model = UserOfflineScriptExportAccess
        fields = ('id', 'user', 'payed', 'date', 'script', 'exported_date')
