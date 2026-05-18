from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.validators import FileExtensionValidator



class Business(models.Model):
    class BusinessTypes(models.TextChoices):
        RESTAURANT = "restaurant", "Restaurant"
        SHOP = "shop", "Shop"
        CAFE = "cafe", "Cafe"

    name = models.CharField(max_length=50)
    business_type = models.CharField(
        max_length=12,
        choices=BusinessTypes.choices,
        default=BusinessTypes.RESTAURANT,
    )
    owner = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, related_name="businesses")
    currency = models.CharField(max_length=5)
    background_image = models.FileField(
    blank=True,
    upload_to="system/files/images",
    validators=[FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png", "webp"])],
)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FeatureConfig(models.Model):
    business = models.OneToOneField(Business, on_delete=models.CASCADE, related_name="feature_config")

    enable_tables = models.BooleanField(default=True)
    enable_kitchen = models.BooleanField(default=True)
    enable_inventory = models.BooleanField(default=False)
    enable_barcode = models.BooleanField(default=False)
    enable_variants = models.BooleanField(default=True)
    enable_discounts = models.BooleanField(default=True)
    enable_partial_payments = models.BooleanField(default=True)

    def __str__(self):
        return f"Feature config for {self.business.name}"


class Setting(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="settings")
    key = models.CharField(max_length=100)
    value = models.JSONField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["business", "key"], name="unique_business_setting_key")
        ]

    def __str__(self):
        return f"{self.business.name}: {self.key}"


class Financial(models.Model):
    business = models.OneToOneField(Business, on_delete=models.CASCADE, related_name="financial_config")
    tax = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0, message="Tax cannot be less than zero"),
            MaxValueValidator(100, message="Tax is limited to 100%"),
        ],
    )
    service_charge = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0, message="Service charge cannot be less than zero"),
            MaxValueValidator(100, message="Service charge cannot be more than 100%"),
        ],
    )

    def __str__(self):
        return f"Financial config for {self.business.name}"

  
