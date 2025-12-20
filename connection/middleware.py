import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

User = get_user_model()
print(f"the user {User}")
# understand this code 
# explain why django is not async
@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner
    

    async def __call__(self, scope, receive, send):
        # Extract query string token
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token")
        print(f"this the token{token}")

        if token:
            try:
                payload = jwt.decode(token[0], settings.SECRET_KEY, algorithms=["HS256"])
                print(f"this is the payload {payload}")
                scope["user"] = await get_user(payload.get("user_id"))
            except Exception:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
