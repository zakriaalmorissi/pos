from django.db import models
from django.contrib.auth.models import AbstractUser




class CustomUser(AbstractUser):
    name = models.CharField(max_length=20, blank=True, null = True)
    device = models.CharField(max_length=255, blank=True, null=True)  
    is_admin = models.BooleanField(default=False)
    status = models.CharField(max_length=50, choices = (
        ("busy","busy"),
        ("available", "available"), 
        ("offline", "offline"),
        ),
          default="available"
        ) 
    def __str__(self):
        return self.username
    
    @property
    def has_tables(self) -> bool:
        return self.user_tables.exists()
    @property 
    def user_table(self) -> list:
        return list(self.user_tables.values_list("name", flat=True))