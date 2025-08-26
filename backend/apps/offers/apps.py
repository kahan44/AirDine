# apps/offers/apps.py
from django.apps import AppConfig


class OffersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.offers'
    verbose_name = 'Offers'
    
    def ready(self):
        import apps.offers.signals
