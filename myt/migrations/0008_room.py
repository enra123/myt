# Generated by Django 3.2 on 2022-03-11 16:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myt', '0007_remove_mytcard_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_name', models.CharField(max_length=20, unique=True)),
                ('user_count', models.IntegerField(default=0)),
            ],
        ),
    ]
