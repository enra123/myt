from django.db import models


# Create your models here.
from jsonfield import JSONField


class Myt(models.Model):
    character = models.CharField(null=False, max_length=50)
    level = models.IntegerField(default=0)
    account = models.IntegerField(null=False)
    role = models.CharField(max_length=50)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=0)


class MytCard(models.Model):
    legion = models.CharField(max_length=50)
    day = models.CharField(max_length=10)
    difficulty = models.CharField(max_length=10)
    times = JSONField()
    myts = models.ManyToManyField(Myt, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def name(self):
        return f'myt-card-list-{self.id}'


class Room(models.Model):
    room_name = models.CharField(max_length=20, unique=True)
    user_count = models.IntegerField(default=0)

    @classmethod
    def add(cls, room_name):
        room, created = cls.objects.get_or_create(room_name=room_name)
        room.user_count += 1
        room.save()
        return room.user_count

    @classmethod
    def users_count(cls, room_name):
        rooms = cls.objects.filter(room_name=room_name)
        if rooms.exists():
            return rooms.first().user_count
        return 0

    @classmethod
    def remove(cls, room_name):
        room = cls.objects.get(room_name=room_name)
        room.user_count -= 1
        room.save()
        return room.user_count
