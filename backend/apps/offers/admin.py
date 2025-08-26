# apps/offers/admin.py
from django.contrib import admin
from .models import Offer, OfferUsage, OfferActivation


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'restaurant', 'offer_type', 'discount_text', 
        'valid_from', 'valid_until', 'is_active', 'is_featured',
        'current_uses', 'max_uses'
    ]
    list_filter = [
        'offer_type', 'is_active', 'is_featured', 'restaurant__cuisine',
        'valid_from', 'valid_until'
    ]
    search_fields = ['title', 'description', 'restaurant__name']
    readonly_fields = ['current_uses', 'created_at', 'updated_at']
    date_hierarchy = 'valid_from'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('restaurant', 'title', 'description', 'offer_type', 'image')
        }),
        ('Discount Details', {
            'fields': ('discount_percentage', 'discount_amount', 'maximum_discount_amount')
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until', 'valid_days')
        }),
        ('Conditions', {
            'fields': ('minimum_order_amount', 'terms_and_conditions')
        }),
        ('Usage Limits', {
            'fields': ('max_uses', 'max_uses_per_user', 'current_uses')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('restaurant')


@admin.register(OfferUsage)
class OfferUsageAdmin(admin.ModelAdmin):
    list_display = [
        'offer', 'user', 'used_at', 'order_amount', 'discount_applied'
    ]
    list_filter = ['used_at', 'offer__restaurant']
    search_fields = ['user__username', 'offer__title', 'offer__restaurant__name']
    readonly_fields = ['used_at']
    date_hierarchy = 'used_at'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('offer', 'user', 'offer__restaurant')
    
admin.site.register(OfferActivation)
