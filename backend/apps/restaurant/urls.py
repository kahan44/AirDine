# apps/restaurant/urls.py
from django.urls import path
from .views import (
    RestaurantListView,
    RestaurantDetailView,
    FeaturedRestaurantsView,
    RecommendedRestaurantsView,
    restaurant_stats
)

app_name = 'restaurant'

urlpatterns = [
    # Restaurant list and detail
    path('', RestaurantListView.as_view(), name='restaurant-list'),
    path('<uuid:pk>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    
    # Featured and recommended restaurants
    path('featured/', FeaturedRestaurantsView.as_view(), name='featured-restaurants'),
    path('recommended/', RecommendedRestaurantsView.as_view(), name='recommended-restaurants'),
    
    # Statistics
    path('stats/', restaurant_stats, name='restaurant-stats'),
]