# apps/offers/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import settings
from apps.restaurant.models import Restaurant
import string
import random


class Offer(models.Model):
    OFFER_TYPES = [
        ('percentage', 'Percentage Discount'),
        ('fixed', 'Fixed Amount Discount'),
        ('bogo', 'Buy One Get One'),
        ('combo', 'Combo Deal'),
        ('special', 'Special Offer'),
    ]

    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]

    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE, 
        related_name='offers'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES)
    
    # Discount details
    discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="For percentage discounts (0-100)"
    )
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="For fixed amount discounts"
    )
    
    # Validity
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Day restrictions
    valid_days = models.JSONField(
        default=list,
        blank=True,
        help_text="Days when offer is valid (e.g., ['monday', 'tuesday'])"
    )
    
    # Conditions
    minimum_order_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    maximum_discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Maximum discount amount for percentage offers"
    )
    
    # Usage limits
    max_uses = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Maximum number of times this offer can be used"
    )
    max_uses_per_user = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Maximum uses per user"
    )
    current_uses = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Metadata
    terms_and_conditions = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['restaurant', 'is_active']),
            models.Index(fields=['valid_from', 'valid_until']),
            models.Index(fields=['offer_type']),
            models.Index(fields=['is_featured']),
        ]

    def __str__(self):
        return f"{self.title} - {self.restaurant.name}"

    @property
    def is_valid(self):
        """Check if offer is currently valid"""
        now = timezone.now()
        return (
            self.is_active and 
            self.valid_from <= now <= self.valid_until and
            (self.max_uses is None or self.current_uses < self.max_uses)
        )

    @property
    def is_day_valid(self):
        """Check if offer is valid for current day"""
        if not self.valid_days:
            return True
        
        current_day = timezone.now().strftime('%A').lower()
        return current_day in self.valid_days

    @property
    def discount_text(self):
        """Get formatted discount text"""
        if self.offer_type == 'percentage':
            return f"{self.discount_percentage}% OFF"
        elif self.offer_type == 'fixed':
            return f"${self.discount_amount} OFF"
        elif self.offer_type == 'bogo':
            return "Buy 1 Get 1 FREE"
        elif self.offer_type == 'combo':
            return "Combo Deal"
        else:
            return "Special Offer"

    @property
    def savings_text(self):
        """Get savings description"""
        if self.minimum_order_amount:
            return f"Min order ${self.minimum_order_amount}"
        return "No minimum order"

    def can_be_used_by_user(self, user):
        """Check if offer can be used by specific user"""
        if not self.is_valid:
            return False
        
        # Check if user has exceeded usage limit (including expired activations)
        total_usage_count = OfferUsage.objects.filter(
            offer=self,
            user=user
        ).count()  # This includes both 'used' and 'expired' status
        
        return total_usage_count < self.max_uses_per_user

    def use_offer(self):
        """Increment usage counter"""
        self.current_uses += 1
        self.save(update_fields=['current_uses'])


class OfferUsage(models.Model):
    """Track offer usage by users"""
    USAGE_STATUS_CHOICES = [
        ('used', 'Actually Used'),
        ('expired', 'Expired Without Use'),
    ]
    
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    used_at = models.DateTimeField()  # Removed auto_now_add to allow manual setting
    order_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=USAGE_STATUS_CHOICES, default='used')
    # Link to the activation that created this usage (for expired activations)
    activation = models.ForeignKey('OfferActivation', on_delete=models.SET_NULL, null=True, blank=True, related_name='usage_record')

    class Meta:
        ordering = ['-used_at']
        indexes = [
            models.Index(fields=['offer', 'user']),
            models.Index(fields=['used_at']),
            models.Index(fields=['status']),
            models.Index(fields=['activation']),
        ]
        constraints = [
            # Ensure one usage record per activation (prevents duplicates)
            models.UniqueConstraint(
                fields=['activation'],
                condition=models.Q(activation__isnull=False),
                name='unique_usage_per_activation'
            )
        ]

    def __str__(self):
        if self.status == 'expired':
            return f"{self.user.username} expired {self.offer.title} on {self.used_at}"
        return f"{self.user.username} used {self.offer.title} on {self.used_at}"


class OfferActivation(models.Model):
    """Track offer activation codes for redemption"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('redeemed', 'Redeemed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='activations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activation_code = models.CharField(max_length=6, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    redeemed_at = models.DateTimeField(null=True, blank=True)
    redeemed_by_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='redeemed_activations'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['activation_code']),
            models.Index(fields=['status', 'expires_at']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.activation_code} - {self.offer.title} ({self.status})"
    
    @classmethod
    def generate_code(cls):
        """Generate a unique 6-digit alphanumeric code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not cls.objects.filter(activation_code=code).exists():
                return code
    
    @property
    def is_expired(self):
        """Check if activation code has expired"""
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        """Check if activation code is valid for redemption"""
        return (
            self.status == 'pending' and 
            not self.is_expired and
            self.offer.is_valid
        )
    
    def redeem(self, admin_user):
        """Redeem the activation code"""
        if not self.is_valid:
            raise ValueError("Activation code is not valid for redemption")
        
        # Check if user can still use this offer
        if not self.offer.can_be_used_by_user(self.user):
            raise ValueError("User has exceeded maximum usage limit for this offer")
        
        self.status = 'redeemed'
        self.redeemed_at = timezone.now()
        self.redeemed_by_admin = admin_user
        self.save()
        
        # Create usage record with placeholder values
        # In a real application, these would be calculated from actual order data
        OfferUsage.objects.create(
            offer=self.offer,
            user=self.user,
            used_at=timezone.now(),  # Set current time for actual usage
            order_amount=0,  # Will be updated when connected to actual order system
            discount_applied=0,  # Will be calculated based on offer type and order amount
            status='used'  # Mark as actually used
        )
        
        # Increment offer usage counter
        self.offer.use_offer()
        
        return True
    
    @classmethod
    def update_expired_activations(cls):
        """Update all expired pending activations to expired status and create usage records"""
        from django.db import transaction
        
        now = timezone.now()
        
        with transaction.atomic():
            # Get expired activations with lock to prevent race conditions
            expired_activations = cls.objects.filter(
                status='pending',
                expires_at__lt=now
            ).select_related('offer', 'user').select_for_update()
            
            # Create OfferUsage records for expired activations
            usage_records = []
            activation_ids_to_update = []
            
            for activation in expired_activations:
                # Check if usage record already exists for this specific activation
                existing_usage = OfferUsage.objects.filter(activation=activation).exists()
                
                if not existing_usage:
                    usage_records.append(OfferUsage(
                        offer=activation.offer,
                        user=activation.user,
                        used_at=activation.expires_at,  # Use expiration time as usage time
                        order_amount=0,  # No order amount for expired activation
                        discount_applied=0,  # No discount applied for expired activation
                        status='expired',  # Mark as expired usage
                        activation=activation  # Link to the specific activation
                    ))
                    activation_ids_to_update.append(activation.id)
            
            # Bulk create usage records (with unique constraint protection)
            if usage_records:
                try:
                    OfferUsage.objects.bulk_create(usage_records, ignore_conflicts=True)
                except Exception as e:
                    # Handle any remaining race conditions gracefully
                    print(f"Warning: Failed to create some usage records: {e}")
            
            # Update only the activations we processed to expired status
            if activation_ids_to_update:
                expired_count = cls.objects.filter(id__in=activation_ids_to_update).update(status='expired')
            else:
                expired_count = 0
        
        return expired_count
    
    def check_and_update_expiration(self):
        """Check if this activation has expired and update status if needed"""
        # Handle both pending activations that need to be expired, and already expired activations
        if (self.status == 'pending' and self.is_expired) or self.status == 'expired':
            # Create usage record for expired activation (exactly one per activation)
            existing_usage = OfferUsage.objects.filter(activation=self).exists()
            
            if not existing_usage:
                OfferUsage.objects.create(
                    offer=self.offer,
                    user=self.user,
                    used_at=self.expires_at,  # Use expiration time as usage time
                    order_amount=0,  # No order amount for expired activation
                    discount_applied=0,  # No discount applied for expired activation
                    status='expired',  # Mark as expired usage
                    activation=self  # Link to this specific activation
                )
            
            # Update status if it was pending
            if self.status == 'pending':
                self.status = 'expired'
                self.save(update_fields=['status'])
            
            return True
        return False
    
    def save(self, *args, **kwargs):
        if not self.activation_code:
            self.activation_code = self.generate_code()
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=2)
        super().save(*args, **kwargs)
