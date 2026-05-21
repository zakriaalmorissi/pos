from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal
from accounts.models import CustomUser
from system_config.models import Business
# Create your models here.


class TablesGroup(models.Model):
    class TablesType(models.TextChoices):
        NORMAL = "noraml", "Normal"
        RESERVATION = "reservation", "Reservation"
        BUFFET = "buffet", "Buffet"
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="table_groups")
    name = models.CharField(max_length=30, unique=True)
    tables_type = models.CharField(max_length=20, choices=TablesType.choices, default=TablesType.NORMAL)


class Table(models.Model):
    group = models.ForeignKey(TablesGroup, on_delete=models.CASCADE, related_name="tables")
    name = models.CharField(max_length=15, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="user_tables", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    
    
    @property
    def counted_bills(self) -> int:
        return self.bills.count()
    
    @property 
    def has_orders(self) -> bool:
        return self.bills.filter(orders__isnull=False).exists()



class TableStatus(models.Model):
    table = models.OneToOneField(Table, on_delete=models.CASCADE, related_name="status")
    status = models.CharField(choices=[
    ("available", "Available"),
    ("occupied", "Occupied"),
    ("busy", "Busy"),
    ],
    max_length=23,
    default= "available")

    note = models.TextField(blank=True,)
    date = models.DateTimeField(auto_now=True)


    def __str__(self) -> str: 
        return f"{self.table.name}, available: {self.status}"


class Bill(models.Model):
    BILL_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    name = models.CharField(max_length=30, blank=True)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="bills", blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    status = models.CharField(max_length=30, choices = BILL_STATUS_CHOICES,
    default="pending"
    )
    customer_number = models.PositiveIntegerField(default=0)
    discount = models.DecimalField(max_digits=10, default=00.00, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total = models.DecimalField(max_digits=11, default=0.00, decimal_places=2)

    def __str__(self) -> str:
        return f"name: {self.name}"
    

    @property 
    def service_charge(self) -> Decimal:
        # Get orders that only have the status of (dine in) bcz no service charge for take out orders
        orders = Order.objects.filter(bill= self.pk, status= "dine in")
        price = Decimal("0")
        for order in orders:
            price += order.total_price
        return  (price * 5 / 100)
    
    
    @property 
    def tax(self) ->  Decimal: 
        return Decimal(self.total * 1 / 100)
    


def validate_positive(value):
       if value <= 0:
           raise ValidationError("Quantity must be bigger than Zero")
       

class Order(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="orders")
    name = models.CharField(max_length=240)
    quantity = models.PositiveIntegerField(default=1, validators=[validate_positive])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condiments = models.CharField(max_length=400, blank=True)
    created_at = models.DateTimeField(auto_now_add=True) # what is the difference between auto_add_now and auto_now ?
    updated_at = models.DateTimeField(auto_now=True)
    
    status = models.CharField(max_length=30, choices=(("dine in", "Dine in"), ('take out', "Take out")), default="dine in")
    is_ordered = models.BooleanField(default=False)

    @property 
    def total_price(self) -> Decimal: 
        return (self.price * self.quantity)
    

    def __str__(self) -> str:
        return f"name: {self.name}, condiments: {self.condiments}"
 
