# apps/offers/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Offer, OfferUsage, OfferActivation
from apps.restaurant.serializers import RestaurantListSerializer


class OfferSerializer(serializers.ModelSerializer):
    restaurant = RestaurantListSerializer(read_only=True)
    discount_text = serializers.ReadOnlyField()
    savings_text = serializers.ReadOnlyField()
    is_valid = serializers.ReadOnlyField()
    is_day_valid = serializers.ReadOnlyField()
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_cuisine = serializers.CharField(source='restaurant.cuisine', read_only=True)
    restaurant_image = serializers.CharField(source='restaurant.image', read_only=True)
    restaurant_rating = serializers.DecimalField(source='restaurant.rating', max_digits=3, decimal_places=2, read_only=True)
    restaurant_address = serializers.CharField(source='restaurant.address', read_only=True)
    user_activation = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'restaurant', 'restaurant_name', 'restaurant_cuisine', 
            'restaurant_image', 'restaurant_rating', 'restaurant_address',
            'title', 'description', 'offer_type',
            'discount_percentage', 'discount_amount', 'discount_text',
            'valid_from', 'valid_until', 'valid_days',
            'minimum_order_amount', 'maximum_discount_amount', 'savings_text',
            'max_uses', 'max_uses_per_user', 'current_uses',
            'is_active', 'is_featured', 'is_valid', 'is_day_valid',
            'terms_and_conditions', 'image', 'created_at', 'updated_at', 'user_activation'
        ]
    
    def get_user_activation(self, obj):
        """Get user's current activation for this offer"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            activation = OfferActivation.objects.filter(
                offer=obj,
                user=request.user,
                status='pending'
            ).first()
            
            if activation and activation.is_valid:
                return {
                    'activation_code': activation.activation_code,
                    'expires_at': activation.expires_at,
                    'created_at': activation.created_at
                }
        except:
            pass
        
        return None


class OfferListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for offer listings"""
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_cuisine = serializers.CharField(source='restaurant.cuisine', read_only=True)
    restaurant_image = serializers.CharField(source='restaurant.image', read_only=True)
    restaurant_rating = serializers.DecimalField(source='restaurant.rating', max_digits=3, decimal_places=2, read_only=True)
    discount_text = serializers.ReadOnlyField()
    savings_text = serializers.ReadOnlyField()
    is_valid = serializers.ReadOnlyField()
    user_activation = serializers.SerializerMethodField()
    remaining_uses = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'restaurant_name', 'restaurant_cuisine', 'restaurant_image', 
            'restaurant_rating', 'title', 'description', 'offer_type',
            'discount_text', 'savings_text', 'valid_from', 'valid_until',
            'minimum_order_amount', 'is_active', 'is_featured', 'is_valid',
            'image', 'created_at', 'user_activation', 'remaining_uses'
        ]
    
    def get_remaining_uses(self, obj):
        """Get remaining uses for authenticated user"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            # Count total usage (both used and expired)
            total_usage = OfferUsage.objects.filter(
                offer=obj,
                user=request.user
            ).count()
            
            remaining = obj.max_uses_per_user - total_usage
            return max(0, remaining)  # Never return negative
        except:
            return obj.max_uses_per_user
    
    def get_user_activation(self, obj):
        """Get user's current activation for this offer"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            activation = OfferActivation.objects.filter(
                offer=obj,
                user=request.user,
                status='pending'
            ).first()
            
            if activation and activation.is_valid:
                return {
                    'activation_code': activation.activation_code,
                    'expires_at': activation.expires_at,
                    'created_at': activation.created_at
                }
        except:
            pass
        
        return None


class RestaurantOfferSerializer(serializers.ModelSerializer):
    """Serializer for offers shown on restaurant detail page"""
    discount_text = serializers.ReadOnlyField()
    savings_text = serializers.ReadOnlyField()
    is_valid = serializers.ReadOnlyField()
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'description', 'offer_type',
            'discount_text', 'savings_text', 'valid_from', 'valid_until',
            'minimum_order_amount', 'terms_and_conditions', 'is_valid',
            'time_remaining', 'image'
        ]
    
    def get_time_remaining(self, obj):
        """Get human-readable time remaining for the offer"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        if obj.valid_until <= now:
            return "Expired"
        
        remaining = obj.valid_until - now
        if remaining.days > 0:
            return f"{remaining.days} days left"
        elif remaining.seconds > 3600:
            hours = remaining.seconds // 3600
            return f"{hours} hours left"
        else:
            minutes = remaining.seconds // 60
            return f"{minutes} minutes left"


class OfferUsageSerializer(serializers.ModelSerializer):
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    restaurant_name = serializers.CharField(source='offer.restaurant.name', read_only=True)
    
    class Meta:
        model = OfferUsage
        fields = [
            'id', 'offer', 'offer_title', 'restaurant_name',
            'used_at', 'order_amount', 'discount_applied'
        ]


class OfferActivationSerializer(serializers.ModelSerializer):
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    restaurant_name = serializers.CharField(source='offer.restaurant.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    time_remaining = serializers.SerializerMethodField()
    is_expired = serializers.ReadOnlyField()
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = OfferActivation
        fields = [
            'id', 'offer', 'offer_title', 'restaurant_name', 
            'user', 'user_email', 'user_name',
            'activation_code', 'status', 'created_at', 'expires_at', 
            'redeemed_at', 'time_remaining', 'is_expired', 'is_valid'
        ]
        read_only_fields = ['activation_code', 'status', 'created_at', 'expires_at', 'redeemed_at']
    
    def get_time_remaining(self, obj):
        if obj.status != 'pending':
            return None
        
        remaining = obj.expires_at - timezone.now()
        if remaining.total_seconds() <= 0:
            return "Expired"
        
        minutes = int(remaining.total_seconds() // 60)
        seconds = int(remaining.total_seconds() % 60)
        
        if minutes > 0:
            return f"{minutes}m {seconds}s"
        return f"{seconds}s"


class RedeemOfferSerializer(serializers.Serializer):
    activation_code = serializers.CharField(max_length=6, min_length=6)
    
    def validate_activation_code(self, value):
        try:
            activation = OfferActivation.objects.get(activation_code=value.upper())
            if not activation.is_valid:
                if activation.is_expired:
                    raise serializers.ValidationError("Activation code has expired")
                elif activation.status == 'redeemed':
                    raise serializers.ValidationError("Activation code has already been redeemed")
                else:
                    raise serializers.ValidationError("Activation code is not valid")
            return value.upper()
        except OfferActivation.DoesNotExist:
            raise serializers.ValidationError("Invalid activation code")
