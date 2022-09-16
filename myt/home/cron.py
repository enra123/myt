if __name__ == "__main__":
    import os

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myt.site.settings')
    import django

    django.setup()

import logging
import aiohttp
import asyncio
import datetime
from channels.db import database_sync_to_async

from django.db import transaction

from myt.home.models import Myt, MytCard, Announcement
from myt.home.utils import scrape_character_info_dict_batch, CharacterNotFoundError

logger = logging.getLogger(__name__)


@database_sync_to_async
def save_updated_myts(myt_dicts):
    with transaction.atomic():
        for myt_dict in myt_dicts:
            if isinstance(myt_dict, CharacterNotFoundError):
                continue
            character = myt_dict['character']
            level = myt_dict['level']
            logger.info(f'cron updating {character}: {level}')
            Myt.objects.filter(character=character).update(level=level)


@database_sync_to_async
def get_myt_characters():
    myts = Myt.objects.all()
    characters = [myt.character for myt in myts]
    return characters


async def fetch_and_update_myts():
    characters = await get_myt_characters()

    myt_dicts = []
    async with aiohttp.ClientSession() as session:
        tasks = [(scrape_character_info_dict_batch(character, session)) for character in characters]
        myt_dicts.extend(await asyncio.gather(*tasks, return_exceptions=True))

    await save_updated_myts(myt_dicts)


def update_myts_info():
    logger.info("updating myts cron start")
    loop = asyncio.get_event_loop()
    loop.run_until_complete(fetch_and_update_myts())
    loop.close()
    logger.info("updating myts cron end")


def clear_unpinned_myt_cards_day_before():
    logger.info("clearing unpinned myt cards")
    weekday_num_kr_dict = {
        0: '월',
        1: '화',
        2: '수',
        3: '목',
        4: '금',
        5: '토',
        6: '일'
    }
    # utc 20:20(scheduled cron time) day is the previous day of kr
    weekday_num = datetime.datetime.today().weekday()
    MytCard.objects.filter(pinned=False, day=weekday_num_kr_dict[weekday_num]).delete()
    logger.info("cleared unpinned myt cards")


def clear_announcements():
    logger.info("clearing announcements")
    announcements = Announcement.objects.filter(is_deleted=False)

    for announcement in announcements:
        announcement.is_deleted = True
        announcement.save()

    logger.info("cleared announcements")

