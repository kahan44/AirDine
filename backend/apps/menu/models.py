from django.db import models
from django.core.validators import MinValueValidator
from apps.restaurant.models import Restaurant

class MenuCategory(models.Model):
    """Categories for menu items like Appetizers, Main Course, Desserts, etc."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = "Menu Categories"
    
    def __str__(self):
        return self.name

class MenuItem(models.Model):
    """Individual menu items for restaurants"""
    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE, 
        related_name='menu_items'
    )
    category = models.ForeignKey(
        MenuCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='menu_items'
    )
    
    # Basic Info
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        validators=[MinValueValidator(0.01)]
    )
    
    # Images
    image = models.URLField(blank=True, help_text="Menu item image URL")
    
    # Dietary Information
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    
    # Availability
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    display_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['category__display_order', 'display_order', 'name']
        unique_together = ['restaurant', 'name']
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"
