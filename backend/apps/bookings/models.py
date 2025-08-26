from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import settings
from apps.restaurant.models import Restaurant
from apps.offers.models import Offer
import uuid


class TimeSlot(models.Model):
    """Available time slots for restaurant bookings"""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='time_slots')
    time = models.TimeField()
    max_capacity = models.PositiveIntegerField(default=10, help_text="Maximum bookings for this time slot")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('restaurant', 'time')
        ordering = ['time']
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.time.strftime('%H:%M')}"
    
    def get_available_slots(self, date):
        """Get available slots for a specific date"""
        booked_count = self.bookings.filter(
            booking_date=date,
            status__in=['confirmed', 'pending']
        ).count()
        
        return max(0, self.max_capacity - booked_count)


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='bookings')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='bookings')
    
    # Booking details
    booking_date = models.DateField()
    party_size = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])
    special_requests = models.TextField(blank=True, help_text="Any special requests or notes")
    
    # Contact information
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField()
    
    # Offer and pricing
    applied_offer = models.ForeignKey(
        Offer, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='bookings'
    )
    original_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Status and timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    # Additional fields
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    notes = models.TextField(blank=True, help_text="Internal notes")
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'restaurant', 'booking_date', 'time_slot')
    
    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = self.generate_booking_reference()
        
        # Calculate amounts if offer is applied
        if self.applied_offer:
            self.calculate_pricing()
        
        super().save(*args, **kwargs)
    
    def generate_booking_reference(self):
        """Generate unique booking reference"""
        import random
        import string
        
        while True:
            ref = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Booking.objects.filter(booking_reference=ref).exists():
                return ref
    
    def calculate_pricing(self):
        """Calculate pricing with applied offer"""
        # Base amount (could be based on party size, time, etc.)
        base_amount = 50.00  # Base booking fee per person
        self.original_amount = base_amount * self.party_size
        
        if self.applied_offer:
            if self.applied_offer.offer_type == 'percentage':
                self.discount_amount = (self.original_amount * self.applied_offer.discount_value) / 100
            elif self.applied_offer.offer_type == 'fixed':
                self.discount_amount = min(self.applied_offer.discount_value, self.original_amount)
            else:
                self.discount_amount = 0
        else:
            self.discount_amount = 0
        
        self.final_amount = max(0, self.original_amount - self.discount_amount)
    
    def can_be_cancelled(self):
        """Check if booking can be cancelled"""
        if self.status in ['cancelled', 'completed', 'no_show']:
            return False
        
        # Can't cancel if booking is less than 2 hours away
        booking_datetime = timezone.datetime.combine(
            self.booking_date, 
            self.time_slot.time
        )
        booking_datetime = timezone.make_aware(booking_datetime)
        
        return booking_datetime > timezone.now() + timezone.timedelta(hours=2)
    
    def confirm(self):
        """Confirm the booking"""
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()
    
    def cancel(self):
        """Cancel the booking"""
        if self.can_be_cancelled():
            self.status = 'cancelled'
            self.save()
            return True
        return False
    
    def __str__(self):
        return f"{self.booking_reference} - {self.customer_name} at {self.restaurant.name}"


class DateTimeSlot(models.Model):
    """Available time slots for specific dates"""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='date_time_slots')
    date = models.DateField()
    time = models.TimeField()
    max_capacity = models.PositiveIntegerField(default=10, help_text="Maximum bookings for this time slot")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('restaurant', 'date', 'time')
        ordering = ['date', 'time']
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.date} {self.time.strftime('%H:%M')}"
    
    def get_available_slots(self):
        """Get available slots for this specific date and time"""
        booked_count = Booking.objects.filter(
            restaurant=self.restaurant,
            booking_date=self.date,
            time_slot__time=self.time,
            status__in=['confirmed', 'pending']
        ).count()
        
        return max(0, self.max_capacity - booked_count)


class BookingHistory(models.Model):
    """Track booking status changes"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='history')
    status_from = models.CharField(max_length=20)
    status_to = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.booking.booking_reference}: {self.status_from} -> {self.status_to}"
