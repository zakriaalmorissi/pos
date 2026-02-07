from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import json
from tables.models import Table, TableStatus
from accounts.models import CustomUser
from accounts.views import send_user_update
from decimal import Decimal
from enum import Enum


class TableActions(Enum):
    OCCUPIED = 'occupied'
    OCCUPY = 'occupy'
    AVAILABLE = 'available'
    RELEASE = 'release'
    RELEASED = 'released'
    BUSY = 'busy'



def make_json_safe(data):
    if isinstance(data, dict):
        return {k: make_json_safe(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [make_json_safe(i) for i in data]
    elif isinstance(data, Decimal):
        return float(data)
    return data


class TableConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            self.close()
        else:
            await self.channel_layer.group_add('tables', self.channel_name)
            await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard('tables', self.channel_name)

    async def receive(self, text_data=None, **kwargs):
        if not text_data:
            return
        try:
            event = json.loads(text_data)
            action = event.get("action")
            data = event.get("payload")
            if data: 
                table = await self.get_table(data.get("id"))
                if action == TableActions.OCCUPY.value and table:
                    await self.occupy_table(table=table)
                elif action == TableActions.RELEASE.value and table:
                    await self.release_table(table=table)
                else: 
                    await self.send(f"Failed to {action} the table")
                
        except json.JSONDecodeError as e:
            print(e)

    async def table_update(self, event):
        await self.send_json(event["data"])




    async def occupy_table(self, table: Table):
        table_status = await self.get_table_status(table.id)
        user =  self.scope["user"]
        if table_status:
            table_status.status = TableActions.OCCUPIED.value
            table_status.note = f"Table is Occupied by {user.username}"
            await self.save_table_status(table_status)
            table.user = user
            saved_table = await self.save_table(table=table)
            await self.channel_layer.group_send(
                "tables",
                {
                    "type": "table.update", "data": saved_table
                }
            )
            await self.send(TableActions.OCCUPIED.value)
            # Send the occupy update to the admin dashboard 
            await  self.send_table_update_to_admin()
        else:
            await self.send("Table Failed to occupy table")

        

    async def release_table(self, table:Table): 
        table_status: TableStatus = await self.get_table_status(table.id)
        if table and table_status: 
            table_status.status = TableActions.AVAILABLE.value
            table_status.note = ""
            await self.save_table_status(table_status)
            table.user = None
            await  self.delete_empty_table_bill(table=table)
            saved_table = await self.save_table(table=table)
            await self.channel_layer.group_send(
                "tables",
                {
                    "type": "table.update", "data": saved_table
                }
            )
            # Send this release update to the admin management dashboard
            await self.send(TableActions.RELEASED.value)
            await self.send_table_update_to_admin()
        else:
            await self.send("Table Failed to release table")
    
    

    async def send_table_update_to_admin(self) -> None:
        """
         This is gonna get the user data with its updated tables and  send them to the admins dashboard 

        """
        user: dict = await self.get_user()
        await self.channel_layer.group_send(
                "users", 
                {
                    "type": "user_update",
                    "data": user
                }    
        )

        # Helper function to retrieve the table
    @database_sync_to_async
    def get_table(self, pk) -> Table:
        return Table.objects.filter(id=pk).first()
    
    @database_sync_to_async
    def get_table_status(self, table_id) -> TableStatus:
        status =  TableStatus.objects.filter(table = table_id).first()
        return status

    @database_sync_to_async
    def get_user(self) -> dict:
        user: CustomUser = self.scope["user"]
        data = {
                'id': user.pk,
                'name': user.name,
                'username': user.username,
                'device': user.device,
                'is_superuser': user.is_superuser,
                'is_admin': user.is_admin,
                'is_staff': user.is_staff,
                'has_tables': user.has_tables,
                'user_table': user.user_table
        }
        return data


    @database_sync_to_async
    def save_table(self, table):
        from tables.serializers import DetailedSerializeTable
        # Save the table 
        table.save()

        serialize_table = DetailedSerializeTable(table)
        # Make save json data 
        serialize_table = make_json_safe(serialize_table.data)
        return serialize_table
    
    @database_sync_to_async
    def save_table_status(self, status):
        status.save()

    @database_sync_to_async
    def delete_empty_table_bill(self, table:Table): 
        return table.bills.filter(orders__isnull=True).delete()
       

            


class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('users', self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard('users', self.channel_name)

    async def user_update(self, event):
        await self.send_json(event['data'])


class ReleaseTables(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('release_table', self.channel_name)
        await self.accept()

    async def release(self, event):
        await self.send_json(event["data"])
