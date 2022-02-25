import logging
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from myt.home.utils import process_message_for_db


class MytConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']
        logging.debug(self.group_name)

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        logging.debug(text_data)
        message = json.loads(text_data)

        # Send message to room group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'myt_message',
                'message': message,
                'sender_channel_name': self.channel_name
            }
        )

        try:
            await database_sync_to_async(process_message_for_db)(message)
        except Exception as e:
            logging.debug(e)

    # Send message to WebSocket
    async def myt_message(self, event):
        logging.debug(event)
        message = event['message']

        # Send to everyone else than the sender
        if self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps({
                'message': message
            }))


