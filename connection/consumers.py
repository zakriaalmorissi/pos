from channels.generic.websocket import AsyncJsonWebsocketConsumer

class TableConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('tables', self.channel_name)
        await self.accept()
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'tables',
            self.channel_name
        )

    async def table_update(self, event): 
        await self.send_json(event["data"])


class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('users', self.channel_name)
        await self.accept()

           
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'users',
            self.channel_name
        )

    async def user_update(self, event):
        await self.send_json(event['data'])



class ReleaseTables(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('release_table', self.channel_name)
        await self.accept()


    async def release(self, event):
        await self.send_json(event["data"])