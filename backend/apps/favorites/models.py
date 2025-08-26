# apps/favorites/models.py
from django.db import models
from django.conf import settings
from apps.restaurant.models import Restaurant
import uuid


class Favorite(models.Model):
    """
    Model to store user's favorite restaurants.
    Each user can have multiple favorites, but each restaurant can only be favorited once per user.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'restaurant')
        ordering = ['-created_at']
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'

    def __str__(self):
        return f"{self.user.email} - {self.restaurant.name}"

    @classmethod
    def is_favorited(cls, user, restaurant):
        """Check if a restaurant is favorited by a user"""
        return cls.objects.filter(user=user, restaurant=restaurant).exists()

    @classmethod
    def toggle_favorite(cls, user, restaurant):
        """Toggle favorite status for a restaurant"""
        favorite, created = cls.objects.get_or_create(
            user=user, 
            restaurant=restaurant
        )
        
        if not created:
            favorite.delete()
            return False  # Removed from favorites
        return True  # Added to favorites
