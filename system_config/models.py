from django.db import models

class Business(models.Model):
    class SystemTypes(models.TextChoices):
        RESTAURANT = "restaurant", "Restaurant"
        SHPOP = "shop", "Shop"
        CAFE = "cafe", "Cafe"
    name = models.CharField(max_length=50)
    business_type = models.CharField(
        max_length=12,
        choices=SystemTypes.choices,
        default= SystemTypes.RESTAURANT
    )
    currency = models.CharField(max_length=7)
    background_image = models.ImageField(blank=True, null= True, upload_to="system/images")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class FeatureConfig(models.Model):
    business = models.OneToOneField(Business, on_delete=models.CASCADE)

    enable_tables = models.BooleanField(default=False)
    enable_kitchen = models.BooleanField(default=False)
    enable_inventory = models.BooleanField(default=True)
    enable_barcode = models.BooleanField(default=True)
    enable_variants = models.BooleanField(default=False)
    enable_discounts = models.BooleanField(default=True)
    enable_partial_payments = models.BooleanField(default=True)



class Setting(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    key = models.CharField(max_length=100)
    value = models.JSONField()

    class Meta:
        unique_together = ("business", "key")
  