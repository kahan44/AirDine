# apps/favorites/admin.py
from django.contrib import admin
from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'created_at']
    list_filter = ['created_at', 'restaurant__cuisine']
    search_fields = ['user__email', 'restaurant__name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'restaurant')
