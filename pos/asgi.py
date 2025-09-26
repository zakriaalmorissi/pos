import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from connection.routing import websocket_urlpatterns  # WebSocket routes

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pos.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),      # Traditional HTTP requests
    "websocket": AuthMiddlewareStack(    # WebSocket connections
        URLRouter(websocket_urlpatterns)
    ),
})