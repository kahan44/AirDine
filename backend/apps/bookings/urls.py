from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    # Booking CRUD
    path('', views.BookingListCreateView.as_view(), name='booking-list-create'),
    path('<uuid:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('<uuid:booking_id>/cancel/', views.cancel_booking, name='cancel-booking'),
    path('<uuid:booking_id>/history/', views.booking_history, name='booking-history'),
    
    # Restaurant time slots
    path('restaurant/<uuid:restaurant_id>/time-slots/', views.restaurant_time_slots, name='restaurant-time-slots'),
    
    # Date information
    path('date-info/', views.get_booking_date_info, name='booking-date-info'),
    
    # User booking info
    path('upcoming/', views.upcoming_bookings, name='upcoming-bookings'),
    path('statistics/', views.booking_statistics, name='booking-statistics'),
]
