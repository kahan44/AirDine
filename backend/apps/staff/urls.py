from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.admin_me, name='admin_me'),
    path('dashboard/overview/', views.admin_overview, name='admin_overview'),
    path('dashboard/bookings/', views.admin_bookings, name='admin_bookings'),
    path('dashboard/bookings/<uuid:booking_id>/status/', views.admin_update_booking_status, name='admin_update_booking_status'),
    path('dashboard/reviews/', views.admin_reviews, name='admin_reviews'),
    path('dashboard/offers/', views.admin_offers_list_create, name='admin_offers_list_create'),
    path('dashboard/offers/<int:offer_id>/', views.admin_offer_update_delete, name='admin_offer_update_delete'),
    path('dashboard/offers/redeem/', views.admin_redeem_offer_code, name='admin_redeem_offer_code'),
    path('dashboard/offers/activations/', views.admin_offer_activations, name='admin_offer_activations'),
    path('dashboard/restaurant/', views.admin_restaurant_get_update, name='admin_restaurant_get_update'),
]
