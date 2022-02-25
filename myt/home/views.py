from django.http import JsonResponse
from django.shortcuts import render

from myt.home.models import Myt
from myt.home.serializers import MytSerializer

# # console lines
# import os
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myt.site.settings')
# import django
# django.setup()