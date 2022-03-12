import logging
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from myt.home.utils import process_message_for_db
from myt.home.models import Room

logger = logging.getLogger(__name__)


class MytConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        count = await database_sync_to_async(Room.add)(self.group_name)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'ping_message',
                'message': count,
                'sender_channel_name': self.channel_name
            }
        )

    async def disconnect(self, close_code):
        count = await database_sync_to_async(Room.remove)(self.group_name)
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
        logger.info(text_data)
        message = json.loads(text_data)

        try:
            await database_sync_to_async(process_message_for_db)(message)
        except Exception as e:
            logger.info(e)

        # Send message to room group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'myt_message',
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
