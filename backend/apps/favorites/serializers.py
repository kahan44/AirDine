# apps/favorites/serializers.py
from rest_framework import serializers
from .models import Favorite
from apps.restaurant.models import Restaurant


class FavoriteRestaurantSerializer(serializers.ModelSerializer):
    """Serializer for restaurant data in favorites"""
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'description', 'cuisine', 'address',
            'image', 'rating', 'total_reviews', 'price_range',
            'opening_time', 'closing_time', 'is_active', 'is_favorited'
        ]

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.is_favorited(request.user, obj)
        return False


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorite objects"""
    restaurant = FavoriteRestaurantSerializer(read_only=True)
    restaurant_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'restaurant', 'restaurant_id', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        restaurant_id = validated_data['restaurant_id']
        
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id, is_active=True)
        except Restaurant.DoesNotExist:
            raise serializers.ValidationError("Restaurant not found or inactive.")
        
        # Check if already favorited
        if Favorite.is_favorited(user, restaurant):
            raise serializers.ValidationError("Restaurant is already in favorites.")
        
        return Favorite.objects.create(user=user, restaurant=restaurant)


class FavoriteToggleSerializer(serializers.Serializer):
    """Serializer for toggling favorite status"""
    restaurant_id = serializers.UUIDField()
    
    def validate_restaurant_id(self, value):
        try:
            restaurant = Restaurant.objects.get(id=value, is_active=True)
            return value
        except Restaurant.DoesNotExist:
            raise serializers.ValidationError("Restaurant not found or inactive.")
    
    def save(self):
        user = self.context['request'].user
        restaurant_id = self.validated_data['restaurant_id']
        restaurant = Restaurant.objects.get(id=restaurant_id)
        
        is_favorited = Favorite.toggle_favorite(user, restaurant)
        return {
            'restaurant_id': restaurant_id,
            'is_favorited': is_favorited,
            'message': 'Added to favorites' if is_favorited else 'Removed from favorites'
        }
