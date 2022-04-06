from rest_framework import generics, status
from rest_framework.response import Response

from django.http import HttpResponseBadRequest

from myt.home.models import Myt, MytCard, Room
from myt.home.serializers import MytSerializer, MytCardSerializer, RoomSerializer
from myt.home.utils import scrape_character_info_dict


# ViewSets define the view behavior.
class MytViewSet(generics.ListCreateAPIView):
    serializer_class = MytSerializer

    def get_room(self):
        room_name = self.kwargs.get('room_name', '')
        try:
            room = Room.objects.get(name=room_name)
            return room
        except Room.DoesNotExist:
            return HttpResponseBadRequest('Room not found')

    def get_queryset(self):
        """
        This view should return a list of all myts in the room only.
        """
        return Myt.objects.filter(rooms__in=[self.get_room()], is_deleted=False)

    def get_serializer(self, *args, **kwargs):
        """
        Creating myt requires to do some work(get_character_info_dict)
        before actual creation in db
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())

        method = self.request.method.lower()
        if method == 'post':
            if self.request.data.get('level'):  # already registered myt
                return HttpResponseBadRequest('Room not found')

            kwargs['data'] = scrape_character_info_dict(self.request.data.get('character'))
            kwargs['data']['rooms'] = [self.kwargs['room_name']]

            return serializer_class(*args, **kwargs)
        else:  # get
            return serializer_class(*args, **kwargs)

    # TODO: making this ws instead of http, currently it's doing two round-trips
    def create(self, request, *args, **kwargs):
        """
        Myt record exists in db, then just link the room to the myt and return
        or continue creating a new myt record
        """
        try:
            myt = Myt.objects.get(character=self.request.data.get('character'))
            room = self.get_room()
            myt.rooms.add(room)
            serialized_myt = self.serializer_class(instance=myt)
            headers = self.get_success_headers(serialized_myt.data)
            return Response(serialized_myt.data, status=status.HTTP_201_CREATED, headers=headers)
        except Myt.DoesNotExist:
            return super().create(request, *args, **kwargs)


class MytCardViewSet(generics.ListCreateAPIView):
    serializer_class = MytCardSerializer

    def get_queryset(self):
        """
        This view should return a list of all mytcards in the room only.
        """
        room_name = self.kwargs['room_name']
        try:
            room = Room.objects.get(name=room_name)
        except Room.DoesNotExist:
            return HttpResponseBadRequest('Room not found')

        return MytCard.objects.filter(room=room)


class RoomViewSet(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'name'

