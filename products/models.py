from django.db import models
from system_config.models import Business

# Create your models here.
class Category(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="Categories")
    name = models.CharField(max_length=30)



class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)



class ProductVaraint(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    name = models.CharField(max_length=30)
    barcode = models.CharField(max_length=130, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_qty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    image = models.FileField(upload_to="product/images", blank=True)


class ModifierGroup(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    product_variant = models.ForeignKey(ProductVaraint, on_delete=models.CASCADE, related_name="modifier_groups")
    name = models.CharField(max_length=30)

class Modifier(models.Model):
    modifier_group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE, related_name="modifiers")
    name = models.CharField(max_length=30)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    




    

