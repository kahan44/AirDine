from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user_name', 'restaurant', 'rating', 'title', 'created_at']
    list_filter = ['rating', 'restaurant', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'restaurant__name', 'title', 'comment']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('restaurant', 'user', 'rating', 'title', 'comment')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_name(self, obj):
        return obj.user_name
    user_name.short_description = 'User Name'
