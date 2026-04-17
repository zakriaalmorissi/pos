from django.db import models
from django.contrib.auth.models import AbstractUser

 


class CustomUser(AbstractUser):
    class Status(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
      

    class Role(models.TextChoices):
        USER = "user", "User"
        ADMIN = "admin", "Admin"
        SUPER_ADMIN = "super_admin", "Super Admin"

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OFFLINE)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    device = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return self.name
