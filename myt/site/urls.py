"""djangoProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin

from django.conf.urls import url
from django.urls import path
from myt.home import consumers
from myt.api import myt


urlpatterns = [
    path('api/room/<str:name>', myt.RoomViewSet.as_view()),
    path('api/myt/<str:room_name>', myt.MytViewSet.as_view()),
    path('api/myt-card/<str:room_name>', myt.MytCardViewSet.as_view()),
]

websocket_urlpatterns = [
    path('ws/myt/<str:room_name>', consumers.MytConsumer.as_asgi()),
]