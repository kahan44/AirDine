# apps/favorites/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Favorite
from .serializers import FavoriteSerializer, FavoriteToggleSerializer, FavoriteRestaurantSerializer
from apps.restaurant.models import Restaurant
import logging

logger = logging.getLogger(__name__)


class FavoriteListView(generics.ListAPIView):
    """
    Get list of user's favorite restaurants
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('restaurant')

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            
            return Response({
                'success': True,
                'count': queryset.count(),
                'favorites': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching favorites for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to fetch favorites'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FavoriteCreateView(generics.CreateAPIView):
    """
    Add a restaurant to favorites
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                favorite = serializer.save()
                response_serializer = FavoriteSerializer(favorite, context={'request': request})
                
                return Response({
                    'success': True,
                    'message': 'Restaurant added to favorites',
                    'favorite': response_serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error adding favorite for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to add restaurant to favorites'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FavoriteDeleteView(generics.DestroyAPIView):
    """
    Remove a restaurant from favorites
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        restaurant_id = self.kwargs.get('restaurant_id')
        return get_object_or_404(
            Favorite, 
            user=self.request.user, 
            restaurant__id=restaurant_id
        )

    def destroy(self, request, *args, **kwargs):
        try:
            favorite = self.get_object()
            restaurant_name = favorite.restaurant.name
            favorite.delete()
            
            return Response({
                'success': True,
                'message': f'{restaurant_name} removed from favorites'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error removing favorite for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to remove restaurant from favorites'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request):
    """
    Toggle favorite status for a restaurant
    """
    try:
        serializer = FavoriteToggleSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            result = serializer.save()
            return Response({
                'success': True,
                **result
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error toggling favorite for user {request.user.id}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to toggle favorite status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_favorite_status(request, restaurant_id):
    """
    Check if a restaurant is in user's favorites
    """
    try:
        restaurant = get_object_or_404(Restaurant, id=restaurant_id, is_active=True)
        is_favorited = Favorite.is_favorited(request.user, restaurant)
        
        return Response({
            'success': True,
            'restaurant_id': restaurant_id,
            'is_favorited': is_favorited
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error checking favorite status for user {request.user.id}: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to check favorite status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
