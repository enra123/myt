import logging
import json
import copy

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from myt.home.utils import delete_myt_card_from_room, delete_myt_from_room, add_myt_to_room, create_myt_card, \
    get_myt_card_by_id, add_myt_to_card, delete_myt_from_card, edit_myt_card, append_announcement
from myt.home.tasks import scrape_character_info_and_send_result
from myt.home.models import Room, Myt

logger = logging.getLogger(__name__)


class MytConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room = await database_sync_to_async(Room.objects.get)(name=self.scope['url_route']['kwargs']['room_name'])
        self.group_name = str(self.room.id)

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        count = await database_sync_to_async(Room.increase_user_count)(self.room.id)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'ping_message',
                'message': str(count),
                'sender_channel_name': self.channel_name
            }
        )

    async def disconnect(self, close_code):
        count = await database_sync_to_async(Room.decrease_user_count)(self.room.id)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'ping_message',
                'message': count,
                'sender_channel_name': self.channel_name
            }
        )
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        logger.info(f'{self.group_name}: {text_data}')
        message = json.loads(text_data)
        message_type = 'announcement' if isinstance(message, str) else 'myt_message'

        try:
            if message_type == 'announcement':
                await database_sync_to_async(append_announcement)(self.room, message)
            else:
                message = await self.process_myt_message(message)
        except Exception as e:
            logger.info(e)
            message_type = 'error_message'
            message = 'server error processing the request'

        if message:
            # Send message to room group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': message_type,
                    'message': message,
                    'sender_channel_name': self.channel_name
                }
            )

    # Send message to WebSocket
    async def myt_message(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({'message': message}))

    # Send message to WebSocket
    async def error_message(self, event):
        message = {
            'type': 'error',
            'content': event['message']
        }

        # send only to the sender
        if self.channel_name == event['sender_channel_name']:
            await self.send(text_data=json.dumps({'message': message}))

    # Send message to WebSocket
    async def ping_message(self, event):
        message = {
            'type': 'ping',
            'content': event['message']
        }

        await self.send(text_data=json.dumps({'message': message}))

    # Send message to WebSocket
    async def announcement(self, event):
        message = {
            'type': 'announcement',
            'content': event['message']
        }

        await self.send(text_data=json.dumps({'message': message}))

    # TODO: validation
    async def process_myt_message(self, message):
        result_message = copy.deepcopy(message)
        name = result_message['name']
        action = result_message['action']
        target = result_message['target']
        value = result_message['value']

        if 'source' in name:
            if action == 'delete':
                if target == 'mytCards':
                    card_id = int(value.split('-')[-1])
                    await database_sync_to_async(delete_myt_card_from_room)(self.room, card_id)
                elif target == 'myts':
                    await database_sync_to_async(delete_myt_from_room)(self.room, value['character'])
            elif action == 'add':
                if target == 'myts':
                    try:
                        myt_dict = await database_sync_to_async(add_myt_to_room)(
                            self.room, value['character']
                        )
                        result_message['value'] = myt_dict
                    except Myt.DoesNotExist:
                        await sync_to_async(scrape_character_info_and_send_result.delay)(
                            self.group_name, self.channel_name, result_message
                        )
                        return None
                else:
                    myt_characters = [myt['character'] for myt in value.get('myts', [])]
                    myt_card = await database_sync_to_async(create_myt_card)(
                        self.room, value, myt_characters
                    )
                    value['name'] = myt_card.name

        if 'card' in name:
            card_id = int(name.split('-')[-1])
            myt_card = await database_sync_to_async(get_myt_card_by_id)(self.room, card_id)
            if myt_card is None:
                return
            if action == 'add':
                await database_sync_to_async(add_myt_to_card)(self.room, myt_card, value['character'])
            elif action == 'delete':
                await database_sync_to_async(delete_myt_from_card)(self.room, myt_card, value['character'])
            elif action == 'edit':
                await database_sync_to_async(edit_myt_card)(myt_card.id, {target: value})

        return result_message

