from django.db import models
from django.core.exceptions import ValidationError


# The food category is gonna have serveral subCategories 
class Category (models.Model):
    name = models.CharField(max_length=32, unique=True)
    
    def __str__(self):
        return f"name: {self.name}"




class ParentItems(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=25, blank=True, null=True)
    
    def __str__(self):
        return f"category {self.category.name}, name: {self.name}"


class ChildItems(models.Model):
    category = models.ForeignKey(ParentItems, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=25, unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="children")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    
    
    def __str__(self):
        return f"parent item: {self.category.name}, name: {self.name}"
    


class Condiments(models.Model):
    item = models.ForeignKey(ChildItems, on_delete=models.CASCADE, related_name="components")
    name = models.CharField(max_length=30)
    class Meta:
        unique_together = ["item", "name"]


    def __str__(self):
        return f"item: {self.item.name}, name: {self.name}"
    




class BussinessSetting(models.Model):
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)


    def __str__(self) -> str:
        return f"{self.service_charge}, {self.tax_rate}"

