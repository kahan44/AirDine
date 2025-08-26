# apps/offers/middleware.py
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from .models import OfferActivation
import threading
import time


class OfferExpirationMiddleware(MiddlewareMixin):
    """
    Middleware to periodically update expired offer activations
    """
    _last_check = None
    _check_interval = 300  # Check every 5 minutes
    _lock = threading.Lock()
    
    def process_request(self, request):
        """
        Check and update expired activations periodically
        """
        now = timezone.now()
        
        # Only check if enough time has passed since last check
        with self._lock:
            if (self._last_check is None or 
                (now - self._last_check).total_seconds() > self._check_interval):
                
                # Update expired activations in background thread to avoid blocking requests
                def update_expired():
                    try:
                        expired_count = OfferActivation.update_expired_activations()
                        if expired_count > 0:
                            print(f"Updated {expired_count} expired activations")
                    except Exception as e:
                        print(f"Error updating expired activations: {e}")
                
                # Start background thread
                thread = threading.Thread(target=update_expired, daemon=True)
                thread.start()
                
                self._last_check = now
        
        return None
