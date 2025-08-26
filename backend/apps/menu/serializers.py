from rest_framework import serializers
from .models import MenuItem, MenuCategory

class MenuCategorySerializer(serializers.ModelSerializer):
    """Serializer for menu categories"""
    
    class Meta:
        model = MenuCategory
        fields = [
            'id', 
            'name', 
            'description', 
            'display_order'
        ]

class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for menu items"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'description', 
            'price',
            'image',
            'category',
            'category_name',
            'is_vegetarian',
            'is_vegan',
            'is_gluten_free',
            'is_spicy',
            'is_available',
            'is_featured',
            'display_order'
        ]

class AdminMenuItemSerializer(serializers.ModelSerializer):
    """Admin serializer for menu items with full CRUD capabilities"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'description',
            'price',
            'image',
            'category',
            'category_id',
            'category_name',
            'restaurant_name',
            'is_vegetarian',
            'is_vegan',
            'is_gluten_free',
            'is_spicy',
            'is_available',
            'is_featured',
            'display_order',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'restaurant_name', 'category_id', 'category_name')

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Menu item name must be at least 2 characters long")
        return value.strip()

class RestaurantMenuSerializer(serializers.ModelSerializer):
    """Detailed serializer for restaurant menu with categorized items"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'description',
            'price',
            'image',
            'category_id',
            'category_name',
            'is_vegetarian',
            'is_vegan',
            'is_gluten_free',
            'is_spicy',
            'is_available',
            'is_featured',
            'display_order'
        ]
