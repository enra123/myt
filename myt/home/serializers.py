from rest_framework import serializers
from myt.home.models import Myt, MytCard


class MytSerializer(serializers.ModelSerializer):
    class Meta:
        model = Myt
        fields = ('character', 'level', 'account', 'role')
        # read_only_fields = ('updated_at',)


class MytCardSerializer(serializers.ModelSerializer):
    myts = MytSerializer(read_only=True, many=True)
    times = serializers.JSONField()

    class Meta:
        model = MytCard
        fields = ('name', 'legion', 'day', 'difficulty', 'times', 'myts')
        read_only_fields = ('name', 'legion', 'day', 'difficulty', 'times')



