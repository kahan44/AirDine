from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Booking, TimeSlot, BookingHistory, DateTimeSlot
from apps.restaurant.models import Restaurant
from apps.offers.models import Offer


class TimeSlotSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'time', 'max_capacity', 'available_slots']
    
    def get_available_slots(self, obj):
        date = self.context.get('date')
        if date:
            return obj.get_available_slots(date)
        return obj.max_capacity


class DateTimeSlotSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    
    class Meta:
        model = DateTimeSlot
        fields = ['id', 'time', 'max_capacity', 'available_slots']
    
    def get_available_slots(self, obj):
        return obj.get_available_slots()


class BookingListSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_image = serializers.URLField(source='restaurant.image', read_only=True)
    time_slot_time = serializers.TimeField(source='time_slot.time', read_only=True)
    offer_title = serializers.CharField(source='applied_offer.title', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'restaurant_name', 'restaurant_image',
            'booking_date', 'time_slot_time', 'party_size', 'status',
            'customer_name', 'customer_phone', 'original_amount', 
            'discount_amount', 'final_amount', 'offer_title',
            'created_at', 'can_cancel'
        ]
    
    def get_can_cancel(self, obj):
        return obj.can_be_cancelled()


class BookingDetailSerializer(serializers.ModelSerializer):
    restaurant = serializers.SerializerMethodField()
    time_slot = TimeSlotSerializer(read_only=True)
    applied_offer = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'restaurant', 'time_slot',
            'booking_date', 'party_size', 'special_requests',
            'customer_name', 'customer_phone', 'customer_email',
            'applied_offer', 'original_amount', 'discount_amount', 'final_amount',
            'status', 'created_at', 'updated_at', 'confirmed_at', 'can_cancel'
        ]
    
    def get_restaurant(self, obj):
        return {
            'id': obj.restaurant.id,
            'name': obj.restaurant.name,
            'image': obj.restaurant.image,
            'address': obj.restaurant.address,
            'phone': obj.restaurant.phone,
            'cuisine': obj.restaurant.cuisine
        }
    
    def get_applied_offer(self, obj):
        if obj.applied_offer:
            return {
                'id': obj.applied_offer.id,
                'title': obj.applied_offer.title,
                'description': obj.applied_offer.description,
                'discount_value': obj.applied_offer.discount_value,
                'offer_type': obj.applied_offer.offer_type
            }
        return None
    
    def get_can_cancel(self, obj):
        return obj.can_be_cancelled()


class BookingCreateSerializer(serializers.ModelSerializer):
    restaurant_id = serializers.UUIDField(write_only=True)
    time_slot_id = serializers.IntegerField(write_only=True)
    offer_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'restaurant_id', 'time_slot_id', 'booking_date', 'party_size',
            'special_requests', 'customer_name', 'customer_phone', 
            'customer_email', 'offer_id'
        ]
    
    def validate_booking_date(self, value):
        # Use Django's timezone-aware current date in the configured timezone
        today = timezone.localtime().date()
        
        # Cannot book for past dates
        if value < today:
            raise serializers.ValidationError("Cannot book for past dates.")
        
        # Can only book for next 4 days (today + 3 more days = 4 days total)
        max_date = today + timezone.timedelta(days=3)
        if value > max_date:
            raise serializers.ValidationError(f"Cannot book more than 4 days in advance. Last available date: {max_date}")
        
        return value
    
    def validate_party_size(self, value):
        if value < 1:
            raise serializers.ValidationError("Party size must be at least 1.")
        if value > 20:
            raise serializers.ValidationError("Party size cannot exceed 20.")
        return value
    
    def validate(self, data):
        # Check if restaurant exists
        try:
            restaurant = Restaurant.objects.get(id=data['restaurant_id'])
        except Restaurant.DoesNotExist:
            raise serializers.ValidationError("Restaurant does not exist.")
        
        # Check if time slot exists and belongs to the restaurant for the specific date
        try:
            # First try to find date-specific slot
            date_time_slot = DateTimeSlot.objects.get(
                id=data['time_slot_id'], 
                restaurant=restaurant,
                date=data['booking_date'],
                is_active=True
            )
            # Use the original TimeSlot for the booking relationship
            time_slot = TimeSlot.objects.get(
                restaurant=restaurant,
                time=date_time_slot.time,
                is_active=True
            )
        except (DateTimeSlot.DoesNotExist, TimeSlot.DoesNotExist):
            raise serializers.ValidationError("Invalid time slot for this restaurant and date.")
        
        # Check availability using the date-specific slot
        available_slots = date_time_slot.get_available_slots()
        if available_slots < 1:  # Each booking takes 1 slot regardless of party size
            raise serializers.ValidationError(
                f"No availability. All slots are booked for this time."
            )
        
        # Check if user already has a booking for this restaurant, date, and time
        user = self.context['request'].user
        existing_booking = Booking.objects.filter(
            user=user,
            restaurant=restaurant,
            booking_date=data['booking_date'],
            time_slot=time_slot,
            status__in=['pending', 'confirmed']
        ).exists()
        
        if existing_booking:
            raise serializers.ValidationError(
                "You already have a booking for this restaurant at this time."
            )
        
        # Validate offer if provided
        if data.get('offer_id'):
            try:
                offer = Offer.objects.get(
                    id=data['offer_id'],
                    restaurant=restaurant,
                    is_active=True,
                    start_date__lte=timezone.now().date(),
                    end_date__gte=data['booking_date']
                )
                data['offer'] = offer
            except Offer.DoesNotExist:
                raise serializers.ValidationError("Invalid or expired offer.")
        
        data['restaurant'] = restaurant
        data['time_slot'] = time_slot
        return data
    
    def create(self, validated_data):
        # Remove custom fields before creating
        restaurant = validated_data.pop('restaurant')
        time_slot = validated_data.pop('time_slot')
        offer = validated_data.pop('offer', None)
        validated_data.pop('restaurant_id')
        validated_data.pop('time_slot_id')
        validated_data.pop('offer_id', None)
        
        # Create booking
        booking = Booking.objects.create(
            user=self.context['request'].user,
            restaurant=restaurant,
            time_slot=time_slot,
            applied_offer=offer,
            **validated_data
        )
        
        return booking


class BookingHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = BookingHistory
        fields = [
            'status_from', 'status_to', 'changed_by_name', 
            'changed_at', 'notes'
        ]
