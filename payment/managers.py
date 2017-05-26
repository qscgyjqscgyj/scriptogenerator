import datetime
from django.db import models


class UserOfflineScriptExportAccessManager(models.Manager):
    def get_actual_user_offline_script_export_access_date(self, user):
        accesses = self.filter(user=user, unlim_months__isnull=False)
        date_today = datetime.datetime.now()
        actual_accesses = [access for access in accesses if access.unlime_datetime_expires() > date_today]
        if actual_accesses:
            return max(access.unlime_datetime_expires() for access in actual_accesses)
        return None
