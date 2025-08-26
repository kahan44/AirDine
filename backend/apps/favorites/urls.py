# apps/favorites/urls.py
from django.urls import path
from . import views

app_name = 'favorites'

urlpatterns = [
    # List user's favorites
    path('', views.FavoriteListView.as_view(), name='favorite-list'),
    
    # Add to favorites
    path('add/', views.FavoriteCreateView.as_view(), name='favorite-add'),
    
    # Remove from favorites
    path('remove/<uuid:restaurant_id>/', views.FavoriteDeleteView.as_view(), name='favorite-remove'),
    
    # Toggle favorite status
    path('toggle/', views.toggle_favorite, name='favorite-toggle'),
    
    # Check favorite status
    path('check/<uuid:restaurant_id>/', views.check_favorite_status, name='favorite-check'),
]
