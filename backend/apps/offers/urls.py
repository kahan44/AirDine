# apps/offers/urls.py
from django.urls import path
from . import views

app_name = 'offers'

urlpatterns = [
    # Offer listings
    path('', views.OfferListView.as_view(), name='offer-list'),
    path('featured/', views.FeaturedOffersView.as_view(), name='featured-offers'),
    path('trending/', views.trending_offers, name='trending-offers'),
    path('stats/', views.offer_stats, name='offer-stats'),
    
    # Offer details
    path('<int:id>/', views.OfferDetailView.as_view(), name='offer-detail'),
    
    # Restaurant offers
    path('restaurant/<uuid:restaurant_id>/', views.RestaurantOffersView.as_view(), name='restaurant-offers'),
    
    # User interactions
    path('usage/', views.user_offer_usage, name='user-offer-usage'),
    path('<int:offer_id>/use/', views.use_offer, name='use-offer'),
    
    # Offer activation system
    path('<int:offer_id>/activate/', views.activate_offer, name='activate-offer'),
    path('activations/', views.user_activations, name='user-activations'),
    path('redeemed/', views.user_redeemed_offers, name='user-redeemed-offers'),
    path('redeem/', views.redeem_offer_code, name='redeem-offer-code'),
    path('admin/activations/', views.admin_activations, name='admin-activations'),
]
