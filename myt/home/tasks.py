from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from myt.home.utils import CharacterNotFoundError, scrape_character_info_dict, save_myt


# user request fetching a myt info
@shared_task
def scrape_character_info_and_send_result(room_id, group_name, channel_name, message):
    channel_layer = get_channel_layer()

    try:
        message_type = 'myt_message'
        message['value'] = scrape_character_info_dict(message['value']['character'])
        save_myt(room_id, message['value'])
    except CharacterNotFoundError:
        message_type = 'error_message'
        message = 'character not found'

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': message_type,
            'message': message,
            'sender_channel_name': channel_name
        }
    )
