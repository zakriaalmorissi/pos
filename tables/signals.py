from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Bill, Table
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .views import send_table_update

# We'll use this to track the old table before a Bill is updated
@receiver(pre_save, sender=Bill)
def store_old_table_before_change(sender, instance, **kwargs):
    """
    Store the old table before the Bill is updated.
    """
    if instance.pk:  
        old_bill = Bill.objects.filter(pk=instance.pk).first()
        instance._old_table_id = old_bill.table_id if old_bill else None 
    else:
        instance._old_table_id = None


@receiver(post_save, sender=Bill)
def handle_bill_table_change(sender, instance, created, **kwargs):
    """
    Automatically update WebSocket clients when a bill is created or moved.
    """
    try:
        # If the bill was moved from one table to another
        old_table_id = getattr(instance, "_old_table_id", None) 
        new_table_id = instance.table_id

        # Update the old table if it exists
        if old_table_id and old_table_id != new_table_id:
            old_table = Table.objects.filter(id=old_table_id).first()
            if old_table:
                pass
                #send_table_update(old_table)
        # Always update the new/current table
        if new_table_id:
            new_table = Table.objects.filter(id=new_table_id).first()
            if new_table:
                pass
                #send_table_update(new_table)

    except Exception as e:
        print("Signal error:", e)


@receiver(post_delete, sender=Bill)
def handle_bill_delete(sender, instance, **kwargs):
    """
    When a bill is deleted, update its related table.
    """
    if instance.table:
        send_table_update(instance.table)
