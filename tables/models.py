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
    

   

    


def validate_positive(value):
       if value <= 0:
           raise ValidationError("Quantity must be bigger than Zero")
       