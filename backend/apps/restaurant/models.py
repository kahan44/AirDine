# apps/restaurant/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.urls import reverse
import uuid

class Restaurant(models.Model):
    PRICE_CHOICES = [
        ('$', 'Budget'),
        ('$$', 'Moderate'),
        ('$$$', 'Expensive'),
        ('$$$$', 'Very Expensive'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cuisine = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    
    # Images
    image = models.URLField(help_text="Main restaurant image URL")
    
    # Ratings and Reviews
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)],
        default=0.00
    )
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Pricing
    price_range = models.CharField(max_length=4, choices=PRICE_CHOICES, default='$$')
    
    # Operating hours
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    
    class Meta:
        ordering = ['-rating', 'name']
        
    def __str__(self):
        return self.name
        
    @property
    def is_open(self):
        from datetime import datetime
        now = datetime.now().time()
        return self.opening_time <= now <= self.closing_time
        
    @property
    def average_rating(self):
        return float(self.rating) if self.rating else 0.0