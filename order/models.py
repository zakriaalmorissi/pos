from django.db import models
from django.core.exceptions import ValidationError
from tables.models import  Table
from system_config.models import Business
from products.models import ProductVariant

class Order(models.Model):

    class OrderStatus(models.TextChoices):
        PENDING = "pending"
        PREPARING = "preparing"
        READY = "ready"
        COMPLETED = "completed"
        CANCELLED = "cancelled"

    name = models.CharField(max_length=30, blank=True)
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

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=00)
    service_charge = models.DecimalField(max_digits=10, default=0, decimal_places=2)

    is_paid = models.BooleanField(default=False)

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
    product = models.ForeignKey(ProductVariant, blank=True, null=True, on_delete=models.SET_NULL)
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
    def __str__(self):
        return f"item name:{self.name}, order Id: {self.order.id}"


    
