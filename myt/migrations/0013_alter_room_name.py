# Generated by Django 3.2 on 2022-06-02 06:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myt', '0012_alter_room_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='name',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
