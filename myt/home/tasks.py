import logging

from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from myt.home.utils import CharacterNotFoundError, scrape_character_info_dict, save_myt

logger = logging.getLogger(__name__)


# user request fetching a myt info
@shared_task
def scrape_character_info_and_send_result(group_name, channel_name, message):
    logger.info(f'celery start - {group_name}: {message}')
    channel_layer = get_channel_layer()

    try:
        message_type = 'myt_message'
        message['value'] = scrape_character_info_dict(message['value']['character'])
        save_myt(int(group_name), message['value'])
    except CharacterNotFoundError:
        message_type = 'error_message'
        message = 'character not found'

    logger.info(f'celery result - {group_name}: {message}')
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': message_type,
            'message': message,
            'sender_channel_name': channel_name
        }
    )
