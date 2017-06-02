import datetime
from django.db import models


class UserOfflineScriptExportAccessManager(models.Manager):
    def get_actual_user_offline_script_export_accesses(self, user):
        actual_user_offline_script_export_accesses = self.filter(user=user, exported=False, unlim_months__isnull=True)
        if actual_user_offline_script_export_accesses:
            return actual_user_offline_script_export_accesses
        return None

    def get_actual_user_unlim_offline_script_export_access_date(self, user):
        accesses = self.filter(user=user, unlim_months__isnull=False)
        date_today = datetime.datetime.now()
        actual_accesses = [access for access in accesses if access.unlime_datetime_expires() > date_today]
        if actual_accesses:
            return max(access.unlime_datetime_expires() for access in actual_accesses)
        return None

    def get_actual_user_unlim_offline_script_export_access(self, user):
        accesses = self.filter(user=user, unlim_months__isnull=False)
        date_today = datetime.datetime.now()
        actual_accesses = [access for access in accesses if access.unlime_datetime_expires() > date_today]
        if actual_accesses:
            return actual_accesses[0]
        return None

    def get_actual_user_offline_script_export_access(self, user):
        actual_user_unlim_offline_script_export_access = self.get_actual_user_unlim_offline_script_export_access(user)
        if actual_user_unlim_offline_script_export_access:
            return actual_user_unlim_offline_script_export_access
        else:
            actual_user_offline_script_export_accesses = self.get_actual_user_offline_script_export_accesses(user)
            if actual_user_offline_script_export_accesses:
                return actual_user_offline_script_export_accesses[0]
        return None


class UserScriptDelegationAccessManager(models.Manager):
    def get_active_script_delegation_access(self, user):
        script_delegation_accesses = self.filter(user=user, delegated=False)
        if script_delegation_accesses:
            return script_delegation_accesses[0]
        return None
