from django.core.management.base import BaseCommand, CommandError
from myt.home.models import Room


class Command(BaseCommand):
    help = 'type in a room name(string)'

    def add_arguments(self, parser):
        parser.add_argument('room_name', nargs=1, type=str)

    def handle(self, *args, **options):
        name = options['room_name'][0]

        try:
            Room.objects.get(name=name)
            self.stdout.write(self.style.SUCCESS('room "%s" already exist ' % name))
        except Room.DoesNotExist:
            room = Room(name=name)
            room.save()
            self.stdout.write(self.style.SUCCESS('Successfully created room "%s"' % name))

