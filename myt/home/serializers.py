from rest_framework import serializers
from myt.home.models import Myt, MytCard, Room, Announcement


class MytSerializer(serializers.ModelSerializer):
    rooms = serializers.SlugRelatedField(queryset=Room.objects.all(),
                                         many=True, write_only=True,
                                         slug_field="name")

    class Meta:
        model = Myt
        fields = ('character', 'level', 'account', 'role', 'rooms')


class MytCardSerializer(serializers.ModelSerializer):
    myts = MytSerializer(read_only=True, many=True)
    times = serializers.JSONField()

    class Meta:
        model = MytCard
        fields = ('name', 'legion', 'day', 'difficulty', 'times', 'pinned', 'myts')
        read_only_fields = ('name', 'legion', 'day', 'difficulty', 'times', 'pinned')


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('name',)
        lookup_field = 'name'

    def to_internal_value(self, data):
        if not self.instance:
            data.update({
                'name': ''.join(c for c in data['name'] if c.isalnum()),
            })

        validated_data = super(RoomSerializer, self).to_internal_value(data)

        return validated_data


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ('message',)

    def to_representation(self, instance):
        data = super(AnnouncementSerializer, self).to_representation(instance)

        return data.get('message', '')
