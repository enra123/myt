# Generated by Django 3.2 on 2022-02-21 08:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myt', '0003_alter_myt_updated_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='myt',
            name='character',
            field=models.CharField(max_length=50),
        ),
        migrations.AddField(
            model_name='myt',
            name='id',
            field=models.BigAutoField(auto_created=True, default=1, primary_key=True, serialize=False, verbose_name='ID'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='myt',
            name='is_deleted',
            field=models.BooleanField(default=0),
        ),
    ]