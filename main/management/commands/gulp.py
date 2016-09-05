# -*- coding: utf-8 -*-
from django.core.management.base import NoArgsCommand
import subprocess


class Command(NoArgsCommand):
    help = 'Running django server with gulp'

    def handle(self, *args, **options):
        bash_command = "gulp"
        process = subprocess.Popen(bash_command.split(), stdout=subprocess.PIPE)
        # output = process.communicate()[0]
        while True:
            line = process.stdout.readline()
            if not line: break
            try:
                self.stdout.write(line)
            except UnicodeDecodeError:
                self.stdout.write('Working...')
