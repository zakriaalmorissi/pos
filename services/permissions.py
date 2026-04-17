from accounts.models import CustomUser
from rest_framework.permissions import BasePermission
class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.role in [CustomUser.Role.ADMIN, CustomUser.Role.SUPER_ADMIN] and user.is_authenticated
    

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user: CustomUser = request.user 
        return (
            user.is_authenticated and user.role == CustomUser.Role.SUPER_ADMIN
        )
    