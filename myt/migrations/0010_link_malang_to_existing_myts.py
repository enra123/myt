# Generated by Django 3.2 on 2022-03-15 08:00

from django.db import migrations


def link_malang_to_all_existing(apps, schema_editor):
    Myt = apps.get_model('myt', 'Myt')
    MytCard = apps.get_model('myt', 'MytCard')
    Room = apps.get_model('myt', 'Room')

    malang, created = Room.objects.get_or_create(name='malang')

    for myt in Myt.objects.all():
        myt.rooms.add(malang)

    for myt_card in MytCard.objects.all():
        myt_card.room = malang


class Migration(migrations.Migration):

    dependencies = [
        ('myt', '0009_auto_20220315_1915'),
    ]

    operations = [
        migrations.RunPython(link_malang_to_all_existing),
    ]