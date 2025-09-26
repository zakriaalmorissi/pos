from django.urls import re_path
from .consumers import TableConsumer, UserConsumer, ReleaseTables  # Import your app's consumers

websocket_urlpatterns = [
    re_path(r'ws/table/$', TableConsumer.as_asgi()),
    re_path(r'ws/user/$', UserConsumer.as_asgi()),
    re_path(r'ws/release/$',ReleaseTables.as_asgi())
]