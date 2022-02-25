from django.urls import path, include
from rest_framework import routers, viewsets, generics

from myt.home.models import Myt, MytCard
from myt.home.serializers import MytSerializer, MytCardSerializer
from myt.home.utils import get_character_info_dict


# ViewSets define the view behavior.
class MytViewSet(generics.ListCreateAPIView):
    queryset = Myt.objects.filter(is_deleted=False)
    serializer_class = MytSerializer

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())

        method = self.request.method.lower()
        if method == 'post':
            if not self.request.data.get('level'):
                kwargs['data'] = get_character_info_dict(self.request.data.get('character'))
                return serializer_class(*args, **kwargs)
            return serializer_class(*args, **kwargs)
        else:  # get
            return serializer_class(*args, **kwargs)


class MytCardViewSet(generics.ListCreateAPIView):
    queryset = MytCard.objects.all()
    serializer_class = MytCardSerializer

