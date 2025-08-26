from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch, Count
from collections import defaultdict

from apps.restaurant.models import Restaurant
from apps.staff.models import RestaurantAdmin
from .models import MenuItem, MenuCategory
from .serializers import MenuItemSerializer, RestaurantMenuSerializer, MenuCategorySerializer, AdminMenuItemSerializer

class RestaurantMenuListView(generics.ListAPIView):
    """Get all menu items for a specific restaurant, organized by category"""
    serializer_class = RestaurantMenuSerializer
    
    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return MenuItem.objects.filter(
            restaurant_id=restaurant_id,
            is_available=True
        ).select_related('category', 'restaurant').order_by(
            'category__display_order', 
            'display_order', 
            'name'
        )
    
    def list(self, request, *args, **kwargs):
        restaurant_id = self.kwargs['restaurant_id']
        
        # Check if restaurant exists
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        # Get menu items
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Organize by category
        categorized_menu = defaultdict(list)
        categories_info = {}
        
        for item in serializer.data:
            category_id = item['category_id']
            category_name = item['category_name'] or 'Uncategorized'
            
            categorized_menu[category_name].append(item)
            if category_id and category_name not in categories_info:
                categories_info[category_name] = {
                    'id': category_id,
                    'name': category_name
                }
        
        return Response({
            'restaurant_id': restaurant_id,
            'restaurant_name': restaurant.name,
            'total_items': len(serializer.data),
            'categories': dict(categorized_menu),
            'categories_info': categories_info
        })

class MenuItemDetailView(generics.RetrieveAPIView):
    """Get details of a specific menu item"""
    queryset = MenuItem.objects.select_related('category', 'restaurant')
    serializer_class = MenuItemSerializer
    
class MenuCategoriesListView(generics.ListAPIView):
    """Get all available menu categories"""
    queryset = MenuCategory.objects.filter(is_active=True)
    serializer_class = MenuCategorySerializer

@api_view(['GET'])
def restaurant_menu_summary(request, restaurant_id):
    """Get a summary of restaurant menu (categories and item counts)"""
    restaurant = get_object_or_404(Restaurant, id=restaurant_id)
    
    # Get categories with item counts
    categories = MenuCategory.objects.filter(
        menu_items__restaurant_id=restaurant_id,
        menu_items__is_available=True,
        is_active=True
    ).distinct().annotate(
        item_count=Count('menu_items')
    ).order_by('display_order')
    
    category_data = []
    total_items = 0
    
    for category in categories:
        item_count = MenuItem.objects.filter(
            restaurant_id=restaurant_id,
            category=category,
            is_available=True
        ).count()
        
        category_data.append({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'item_count': item_count,
            'display_order': category.display_order
        })
        total_items += item_count
    
    return Response({
        'restaurant_id': restaurant_id,
        'restaurant_name': restaurant.name,
        'total_items': total_items,
        'categories': category_data
    })


# Admin Menu Management Views
class AdminMenuListView(generics.ListCreateAPIView):
    """Admin view to list and create menu items for their restaurant"""
    serializer_class = AdminMenuItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the restaurant associated with the admin user via RestaurantAdmin
        try:
            restaurant_admin = RestaurantAdmin.objects.get(user=self.request.user)
            restaurant = restaurant_admin.restaurant
            return MenuItem.objects.filter(restaurant=restaurant).select_related('category', 'restaurant').order_by(
                'category__display_order', 'display_order', 'name'
            )
        except RestaurantAdmin.DoesNotExist:
            return MenuItem.objects.none()

    def perform_create(self, serializer):
        # Automatically set the restaurant to the admin's restaurant
        restaurant_admin = get_object_or_404(RestaurantAdmin, user=self.request.user)
        serializer.save(restaurant=restaurant_admin.restaurant)

    def list(self, request, *args, **kwargs):
        try:
            restaurant_admin = RestaurantAdmin.objects.get(user=request.user)
            restaurant = restaurant_admin.restaurant
        except RestaurantAdmin.DoesNotExist:
            return Response({
                'error': 'No restaurant found for this admin user'
            }, status=status.HTTP_404_NOT_FOUND)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Organize by category
        categorized_menu = defaultdict(list)
        categories_info = {}
        
        for item in serializer.data:
            category_id = item.get('category_id')
            category_name = item.get('category_name') or 'Uncategorized'
            
            categorized_menu[category_name].append(item)
            if category_id and category_name not in categories_info:
                categories_info[category_name] = {
                    'id': category_id,
                    'name': category_name
                }

        return Response({
            'restaurant_id': str(restaurant.id),
            'restaurant_name': restaurant.name,
            'total_items': len(serializer.data),
            'categories': dict(categorized_menu),
            'categories_info': categories_info
        })


class AdminMenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to get, update, or delete a specific menu item"""
    serializer_class = AdminMenuItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow access to menu items from the admin's restaurant
        try:
            restaurant_admin = RestaurantAdmin.objects.get(user=self.request.user)
            restaurant = restaurant_admin.restaurant
            return MenuItem.objects.filter(restaurant=restaurant).select_related('category', 'restaurant')
        except RestaurantAdmin.DoesNotExist:
            return MenuItem.objects.none()

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        return obj


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_menu_summary(request):
    """Get menu summary for admin's restaurant"""
    try:
        restaurant_admin = RestaurantAdmin.objects.get(user=request.user)
        restaurant = restaurant_admin.restaurant
    except RestaurantAdmin.DoesNotExist:
        return Response({
            'error': 'No restaurant found for this admin user'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get categories with item counts
    categories = MenuCategory.objects.filter(
        menu_items__restaurant=restaurant,
        is_active=True
    ).distinct().annotate(
        item_count=Count('menu_items')
    ).order_by('display_order')
    
    category_data = []
    total_items = 0
    available_items = 0
    featured_items = 0
    
    for category in categories:
        item_count = MenuItem.objects.filter(
            restaurant=restaurant,
            category=category
        ).count()
        
        available_count = MenuItem.objects.filter(
            restaurant=restaurant,
            category=category,
            is_available=True
        ).count()
        
        category_data.append({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'item_count': item_count,
            'available_count': available_count,
            'display_order': category.display_order
        })
        total_items += item_count
        available_items += available_count
    
    # Count featured items
    featured_items = MenuItem.objects.filter(
        restaurant=restaurant,
        is_featured=True
    ).count()
    
    return Response({
        'restaurant_id': str(restaurant.id),
        'restaurant_name': restaurant.name,
        'total_items': total_items,
        'available_items': available_items,
        'featured_items': featured_items,
        'categories': category_data
    })
