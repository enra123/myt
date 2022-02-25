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
    name = models.CharField(max_length=50)
    legion = models.CharField(max_length=50)
    day = models.CharField(max_length=10)
    difficulty = models.CharField(max_length=10)
    times = JSONField()
    myts = models.ManyToManyField(Myt, blank=True)
    updated_at = models.DateTimeField(auto_now=True)



