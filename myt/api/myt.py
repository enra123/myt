from rest_framework import generics, status
from rest_framework.response import Response

from django.http import HttpResponseBadRequest

from myt.home.models import Myt, MytCard, Room, Announcement
from myt.home.serializers import MytSerializer, MytCardSerializer, RoomSerializer, AnnouncementSerializer
from myt.home.utils import scrape_character_info_dict

ANNOUNCEMENT_MAX_SIZE = 5


class MytRoomMixin:
    """
    This view should return a list of all myts in the room only.
    """
    def get_room(self):
        room_name = self.kwargs.get('room_name', '')
        try:
            room = Room.objects.get(name=room_name)
            return room
        except Room.DoesNotExist:
            return HttpResponseBadRequest('Room not found')


# ViewSets define the view behavior.
class MytViewSet(generics.ListCreateAPIView, MytRoomMixin):
    serializer_class = MytSerializer

    def get_queryset(self):
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


class MytCardViewSet(generics.ListCreateAPIView, MytRoomMixin):
    serializer_class = MytCardSerializer

    def get_queryset(self):
        return MytCard.objects.filter(room=self.get_room())


class RoomViewSet(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'name'


class AnnouncementViewSet(generics.ListAPIView, MytRoomMixin):
    serializer_class = AnnouncementSerializer
    lookup_field = 'message'

    def get_queryset(self):
        """
        This view should return a list of all myts in the room only.
        """
        announcements = Announcement.objects.filter(room=self.get_room(), is_deleted=False) \
                                    .order_by('-id')[:ANNOUNCEMENT_MAX_SIZE]
        return announcements


