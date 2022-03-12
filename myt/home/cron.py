if __name__ == "__main__":
    import os

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myt.site.settings')
    import django

    django.setup()

import logging
from django.http import HttpResponseServerError

from myt.home.models import Myt, Room
from myt.home.utils import scrape_character_info_dict

logger = logging.getLogger(__name__)


def update_myts_info():
    logger.info("updating myts cron start")
    myts = Myt.objects.all()

    for myt in myts:
        try:
            updated_info_dict = scrape_character_info_dict(myt.character)
        except HttpResponseServerError:
            continue
        level = updated_info_dict.get('level', myt.level)
        if level != myt.level:
            logger.info(f'{myt.character}: {myt.level}')
            myt.level = level
            myt.save()

    logger.info("updating myts cron end")


# TODO: fix room user_count numbers if things go wrong, but
# channel-presence library is recommended for proper websocket groups management
def reset_room_user_count():
    logger.info("reset room cron start")
    rooms = Room.objects.all()

    for room in rooms:
        room.user_count = 0
        room.save()

    logger.info("reset room cron end")
