from django.contrib import admin
from .models import Booking, TimeSlot, BookingHistory, DateTimeSlot


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['restaurant', 'time', 'max_capacity', 'is_active']
    list_filter = ['restaurant', 'is_active']
    search_fields = ['restaurant__name']
    ordering = ['restaurant', 'time']


class BookingHistoryInline(admin.TabularInline):
    model = BookingHistory
    extra = 0
    readonly_fields = ['changed_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'booking_reference', 'customer_name', 'restaurant', 
        'booking_date', 'time_slot', 'party_size', 'status', 'created_at'
    ]
    list_filter = ['status', 'booking_date', 'restaurant', 'created_at']
    search_fields = [
        'booking_reference', 'customer_name', 'customer_email', 
        'restaurant__name', 'user__email'
    ]
    readonly_fields = [
        'id', 'booking_reference', 'created_at', 'updated_at', 
        'original_amount', 'discount_amount', 'final_amount'
    ]
    ordering = ['-created_at']
    inlines = [BookingHistoryInline]
    
    fieldsets = (
        ('Booking Information', {
            'fields': (
                'id', 'booking_reference', 'user', 'restaurant', 
                'time_slot', 'booking_date', 'party_size', 'status'
            )
        }),
        ('Customer Details', {
            'fields': ('customer_name', 'customer_phone', 'customer_email')
        }),
        ('Offer & Pricing', {
            'fields': (
                'applied_offer', 'original_amount', 
                'discount_amount', 'final_amount'
            )
        }),
        ('Additional Information', {
            'fields': ('special_requests', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'restaurant', 'time_slot', 'applied_offer'
        )


@admin.register(BookingHistory)
class BookingHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'booking', 'status_from', 'status_to', 
        'changed_by', 'changed_at'
    ]
    list_filter = ['status_from', 'status_to', 'changed_at']
    search_fields = ['booking__booking_reference', 'booking__customer_name']
    readonly_fields = ['changed_at']
    ordering = ['-changed_at']

admin.site.register(DateTimeSlot)