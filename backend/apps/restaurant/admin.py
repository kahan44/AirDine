# apps/restaurant/admin.py
from django.contrib import admin
from .models import Restaurant

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'cuisine', 
        'rating', 
        'total_reviews',
        'price_range', 
        'is_featured', 
        'is_active',
    ]
    list_filter = [
        'cuisine', 
        'price_range', 
        'is_featured', 
        'is_active',
        'rating',
    ]
    search_fields = ['name', 'cuisine', 'address', 'description']
    list_editable = ['is_featured', 'is_active', 'rating']
    ordering = ['-rating', 'name']
    readonly_fields = ['id']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'cuisine', 'image')
        }),
        ('Contact Details', {
            'fields': ('address', 'phone', 'email')
        }),
        ('Ratings & Pricing', {
            'fields': ('rating', 'total_reviews', 'price_range')
        }),
        ('Operating Hours', {
            'fields': ('opening_time', 'closing_time')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()