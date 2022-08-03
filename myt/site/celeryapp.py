import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myt.site.settings')
app = Celery("myt")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

