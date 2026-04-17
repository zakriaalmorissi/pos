from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.response import Response
from rest_framework import status



def refresh_token(request) -> Response:
    refresh = request.data.get("refresh")
    try:
        token = RefreshToken(refresh)
        return Response({"access": str(token.access_token)}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({"error": "Failed to refresh token !"}, status=status.HTTP_400_BAD_REQUEST)

  

def admin_or_super_admin_only(request):
    pass 