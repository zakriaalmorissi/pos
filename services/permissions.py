from accounts.models import CustomUser
from rest_framework.permissions import BasePermission

class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user.is_authenticated:   
            return False  
        has: bool =  user.role in [CustomUser.Role.ADMIN, CustomUser.Role.SUPER_ADMIN] and user.is_authenticated
        return has
     
        
    

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        user: CustomUser = request.user 
        return (
            user.is_authenticated and user.role == CustomUser.Role.SUPER_ADMIN
        )
    

class CanAccessBusiness(BasePermission):
    def has_object_permission(self, request, view, obj):
        staff = request.user.staff
        return staff.business_id == obj.id
