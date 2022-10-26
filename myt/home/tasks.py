import logging

from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from myt.home.utils import CharacterNotFoundError, LostArkProfileConnectionTimeout, \
    scrape_character_info_dict, save_myt

logger = logging.getLogger(__name__)


# user request fetching a myt info
@shared_task
def scrape_character_info_and_send_result(group_name, channel_name, message_content):
    logger.info(f'celery start - {group_name}: {message_content}')
    channel_layer = get_channel_layer()

    try:
        message_type = 'myt'
        message_content['value'] = scrape_character_info_dict(message_content['value']['character'])
        save_myt(int(group_name), message_content['value'])
    except (CharacterNotFoundError, LostArkProfileConnectionTimeout) as e:
        message_type = 'error'
        message_content = e.args[0]

    logger.info(f'celery result - {group_name}: {message_content}')
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': message_type,
            'content': message_content,
            'sender_channel_name': channel_name
        }
    )
