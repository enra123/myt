# Generated by Django 3.2 on 2022-09-16 04:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myt', '0013_alter_room_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='mytcard',
            name='pinned',
            field=models.BooleanField(default=False),
        ),
    ]
