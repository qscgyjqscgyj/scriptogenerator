from django.db import models


class ScriptManager(models.Manager):
    def all_active_scripts(self):
        return self.filter(deleted=False)

    def filter_active_scripts(self, **kwargs):
        kwargs['deleted'] = False
        return self.filter(**kwargs)

    def get_active_script(self, **kwargs):
        kwargs['deleted'] = False
        return self.get(**kwargs)
