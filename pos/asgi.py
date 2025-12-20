
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pos.settings')

# 👇 Initialize Django first before importing anything that touches ORM
django_asgi_app = get_asgi_application()

# Now it’s safe to import middleware and routing
from connection.middleware import JwtAuthMiddleware
from connection.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,      # traditional HTTP requests
    "websocket": JwtAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
