# apps/restaurant/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Restaurant
from .serializers import (
    RestaurantListSerializer, 
    RestaurantDetailSerializer, 
    FeaturedRestaurantSerializer
)

class RestaurantListView(generics.ListAPIView):
    """
    API view to retrieve list of restaurants
    """
    serializer_class = RestaurantListSerializer
    permission_classes = [AllowAny]  # Allow public access to restaurant listings
    
    def get_queryset(self):
        queryset = Restaurant.objects.filter(is_active=True)
        
        # Filter by cuisine if provided
        cuisine = self.request.query_params.get('cuisine', None)
        if cuisine is not None:
            queryset = queryset.filter(cuisine__icontains=cuisine)
            
        # Filter by price range if provided
        price_range = self.request.query_params.get('price_range', None)
        if price_range is not None:
            queryset = queryset.filter(price_range=price_range)
            
        # Search by name or cuisine
        search = self.request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(cuisine__icontains=search) |
                Q(description__icontains=search)
            )
            
        return queryset

class RestaurantDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve a single restaurant
    """
    queryset = Restaurant.objects.filter(is_active=True)
    serializer_class = RestaurantDetailSerializer
    permission_classes = [AllowAny]  # Allow public access to restaurant details

class FeaturedRestaurantsView(generics.ListAPIView):
    """
    API view to retrieve featured restaurants
    """
    serializer_class = FeaturedRestaurantSerializer
    permission_classes = [AllowAny]  # Allow public access to featured restaurants
    
    def get_queryset(self):
        return Restaurant.objects.filter(
            is_active=True, 
            is_featured=True
        ).order_by('-rating')[:6]

class RecommendedRestaurantsView(generics.ListAPIView):
    """
    API view to retrieve recommended restaurants based on rating
    """
    serializer_class = RestaurantListSerializer
    permission_classes = [AllowAny]  # Allow public access to recommended restaurants
    
    def get_queryset(self):
        return Restaurant.objects.filter(
            is_active=True,
            rating__gte=4.0
        ).order_by('-rating', '-total_reviews')[:10]

@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_stats(request):
    """
    API view to get restaurant statistics for dashboard
    """
    total_restaurants = Restaurant.objects.filter(is_active=True).count()
    featured_restaurants = Restaurant.objects.filter(
        is_active=True, 
        is_featured=True
    ).count()
    top_rated = Restaurant.objects.filter(
        is_active=True, 
        rating__gte=4.5
    ).count()
    
    stats = {
        'total_restaurants': total_restaurants,
        'featured_restaurants': featured_restaurants,
        'top_rated_restaurants': top_rated,
    }
    
    return Response(stats, status=status.HTTP_200_OK)