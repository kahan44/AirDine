from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.staff.models import RestaurantAdmin
from apps.restaurant.models import Restaurant
from apps.bookings.models import Booking, BookingHistory
from apps.reviews.models import Review
from apps.offers.models import Offer
from apps.offers.serializers import OfferSerializer
from apps.bookings.serializers import BookingListSerializer
from apps.reviews.serializers import ReviewSerializer

User = get_user_model()


class RestaurantSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'cuisine', 'address', 'phone', 'email', 'image',
            'price_range', 'opening_time', 'closing_time', 'is_active', 'is_featured', 'rating', 'total_reviews'
        ]


class RestaurantAdminProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    restaurant = RestaurantSummarySerializer(read_only=True)

    class Meta:
        model = RestaurantAdmin
        fields = ['id', 'user_email', 'restaurant', 'assigned_at']


class BookingStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['confirmed', 'completed'])
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # status already validated by ChoiceField; nothing extra
        return attrs

