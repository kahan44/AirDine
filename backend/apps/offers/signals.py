# apps/offers/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import OfferActivation


@receiver(post_save, sender=OfferActivation)
def check_activation_expiry(sender, instance, created, **kwargs):
    """
    Signal to check and update activation expiry when an activation is accessed
    """
    if not created and instance.status == 'pending':
        if instance.is_expired:
            # Update status to expired
            OfferActivation.objects.filter(id=instance.id).update(status='expired')
