import logging
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from myt.home.utils import process_myt_message_for_db, append_announcement
from myt.home.models import Room

logger = logging.getLogger(__name__)


class MytConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']

        # Join room group
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()
        count = await database_sync_to_async(Room.increase_user_count)(self.room_name)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'ping_message',
                'message': count,
                'sender_channel_name': self.channel_name
            }
        )

    async def disconnect(self, close_code):
        count = await database_sync_to_async(Room.decrease_user_count)(self.room_name)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'ping_message',
                'message': count,
                'sender_channel_name': self.channel_name
            }
        )
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        logger.info(f'{self.room_name}: {text_data}')
        message = json.loads(text_data)
        message_type = 'announcement' if isinstance(message, str) else 'myt_message'

        try:
            if message_type == 'announcement':
                await database_sync_to_async(append_announcement)(self.room_name, message)
            else:
                await database_sync_to_async(process_myt_message_for_db)(self.room_name, message)
        except Exception as e:
            logger.info(e)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_name,
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
    async def ping_message(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({'message': message}))

    # Send message to WebSocket
    async def announcement(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({'message': message}))
