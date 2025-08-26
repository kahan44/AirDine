from rest_framework.permissions import BasePermission
from apps.staff.models import RestaurantAdmin

class IsRestaurantAdmin(BasePermission):
    """Allows access only to users linked as restaurant admins."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, 'role', None) != 'admin':
            return False
        return RestaurantAdmin.objects.filter(user=user).exists()

    def has_object_permission(self, request, view, obj):
        # For object-level checks against restaurant-owned resources
        try:
            admin_profile = RestaurantAdmin.objects.get(user=request.user)
        except RestaurantAdmin.DoesNotExist:
            return False

        # If obj is a Restaurant, match directly
        if hasattr(obj, 'id') and hasattr(obj, 'name'):
            return obj == admin_profile.restaurant

        # If obj has a restaurant attribute, match it
        restaurant = getattr(obj, 'restaurant', None)
        return restaurant == admin_profile.restaurant
