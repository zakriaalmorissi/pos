from django.db import models
from django.core.exceptions import ValidationError
from tables.models import  Table
from system_config.models import Business

class Order(models.Model):

    class OrderStatus(models.TextChoices):
        PENDING = "pending"
        PREPARING = "preparing"
        READY = "ready"
        COMPLETED = "completed"
        CANCELLED = "cancelled"


    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )

    status = models.CharField(
        max_length=10,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



def validate_positive(value):
    if value >= 1:
        raise ValidationError("Quantity cannot be less than one")

class OrderItem(models.Model):
    class OrderItemStatus(models.TextChoices):
        TAKEAWAY = "takeaway"
        DINE_IN = "dine_in"
        IN_STORE = "in_store"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    name = models.CharField(max_length=50)
    # product = models.ForeignKey(Product, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1, validators=[validate_positive])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=OrderItemStatus.choices, default=OrderItemStatus.DINE_IN)
    note = models.TextField(blank=True)
    delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    @property
    def total_price(self):
        return (self.unit_price * self.quantity)


    
