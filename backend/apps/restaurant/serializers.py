# apps/restaurant/serializers.py
from rest_framework import serializers
from .models import Restaurant

class RestaurantListSerializer(serializers.ModelSerializer):
    """Serializer for listing restaurants with essential information"""
    
    average_rating = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    has_offers = serializers.SerializerMethodField()
    active_offers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine',
            'image',
            'rating',
            'average_rating',
            'total_reviews',
            'price_range',
            'address',
            'is_open',
            'is_featured',
            'is_favorited',
            'has_offers',
            'active_offers_count',
            'opening_time',
            'closing_time',
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.favorites.models import Favorite
            return Favorite.is_favorited(request.user, obj)
        return False

    def get_has_offers(self, obj):
        from django.utils import timezone
        now = timezone.now()
        return obj.offers.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).exists()

    def get_active_offers_count(self, obj):
        from django.utils import timezone
        now = timezone.now()
        return obj.offers.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).count()

class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed restaurant information"""
    
    average_rating = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    active_offers = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'description',
            'cuisine',
            'address',
            'phone',
            'email',
            'image',
            'rating',
            'average_rating',
            'total_reviews',
            'price_range',
            'opening_time',
            'closing_time',
            'is_open',
            'is_featured',
            'is_favorited',
            'active_offers',
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.favorites.models import Favorite
            return Favorite.is_favorited(request.user, obj)
        return False

    def get_active_offers(self, obj):
        from django.utils import timezone
        now = timezone.now()
        offers = obj.offers.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-is_featured', '-created_at')[:5]  # Limit to 5 offers
        
        # Use a simple dict representation instead of importing the serializer
        offer_data = []
        for offer in offers:
            offer_data.append({
                'id': offer.id,
                'title': offer.title,
                'description': offer.description,
                'offer_type': offer.offer_type,
                'discount_text': offer.discount_text,
                'savings_text': offer.savings_text,
                'valid_until': offer.valid_until,
                'minimum_order_amount': offer.minimum_order_amount,
                'terms_and_conditions': offer.terms_and_conditions,
                'is_valid': offer.is_valid,
                'image': offer.image,
            })
        return offer_data

class FeaturedRestaurantSerializer(serializers.ModelSerializer):
    """Serializer for featured restaurants"""
    
    average_rating = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine',
            'image',
            'rating',
            'average_rating',
            'price_range',
            'is_open',
            'is_favorited',
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.favorites.models import Favorite
            return Favorite.is_favorited(request.user, obj)
        return False