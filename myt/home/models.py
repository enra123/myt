from django.db import models

from jsonfield import JSONField


class Room(models.Model):
    name = models.CharField(max_length=20, blank=False, null=False, unique=True)
    user_count = models.IntegerField(default=0)

    @classmethod
    def increase_user_count(cls, room_id):
        room = Room.objects.get(id=room_id)
        room.user_count += 1
        room.save()
        return room.user_count

    @classmethod
    def decrease_user_count(cls, room_id):
        room = Room.objects.get(id=room_id)
        room.user_count -= 1
        room.save()
        return room.user_count


class Myt(models.Model):
    character = models.CharField(null=False, max_length=50)
    level = models.IntegerField(default=0)
    account = models.IntegerField(null=False)
    role = models.CharField(max_length=50)
    updated_at = models.DateTimeField(auto_now=True)
    rooms = models.ManyToManyField(Room)
    is_deleted = models.BooleanField(default=0)


class MytCard(models.Model):
    legion = models.CharField(max_length=50)
    day = models.CharField(max_length=10)
    difficulty = models.CharField(max_length=10)
    times = JSONField()
    myts = models.ManyToManyField(Myt, blank=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def name(self):
        return f'myt-card-list-{self.id}'


class Announcement(models.Model):
    message = models.CharField(max_length=200)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=0)


