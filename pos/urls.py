
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path("system-config/", include("system_config.urls")),
    path("products/", include("products.urls") )
]
