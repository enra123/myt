# Generated by Django 3.2 on 2022-10-14 13:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myt', '0014_mytcard_pinned'),
    ]

    operations = [
        migrations.AddField(
            model_name='mytcard',
            name='message',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
