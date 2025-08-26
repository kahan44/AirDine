from django.contrib import admin
from .models import MenuCategory, MenuItem

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['display_order', 'name']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'category', 'price', 'is_available', 'is_featured']
    list_filter = ['restaurant', 'category', 'is_available', 'is_featured', 'is_vegetarian', 'is_vegan']
    search_fields = ['name', 'description', 'restaurant__name']
    ordering = ['restaurant', 'category__display_order', 'display_order', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'restaurant', 'category', 'price')
        }),
        ('Images', {
            'fields': ('image',)
        }),
        ('Dietary Information', {
            'fields': ('is_vegetarian', 'is_vegan', 'is_gluten_free', 'is_spicy')
        }),
        ('Availability & Display', {
            'fields': ('is_available', 'is_featured', 'display_order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
