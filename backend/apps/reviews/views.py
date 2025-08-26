from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from django.db import transaction

from apps.restaurant.models import Restaurant
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer, ReviewUpdateSerializer

class RestaurantReviewsListView(generics.ListAPIView):
    """Get all reviews for a specific restaurant"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return Review.objects.filter(
            restaurant_id=restaurant_id
        ).select_related('user', 'restaurant').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        try:
            restaurant_id = self.kwargs['restaurant_id']
            
            # Check if restaurant exists
            restaurant = get_object_or_404(Restaurant, id=restaurant_id)
            
            # Get reviews
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            # Calculate statistics
            review_stats = queryset.aggregate(
                total_reviews=Count('id'),
                average_rating=Avg('rating')
            )
            
            # Get user's review if authenticated
            user_review = None
            if request.user.is_authenticated:
                try:
                    user_review_obj = queryset.get(user=request.user)
                    user_review = ReviewSerializer(user_review_obj, context={'request': request}).data
                except Review.DoesNotExist:
                    pass
            
            return Response({
                'restaurant_id': str(restaurant_id),
                'restaurant_name': restaurant.name,
                'total_reviews': review_stats['total_reviews'] or 0,
                'average_rating': round(review_stats['average_rating'] or 0, 2),
                'user_review': user_review,
                'reviews': serializer.data
            })
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in RestaurantReviewsListView: {str(e)}", exc_info=True)
            
            return Response(
                {'error': f'Failed to fetch reviews: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReviewCreateView(generics.CreateAPIView):
    """Create a new review"""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        restaurant_id = self.kwargs['restaurant_id']
        
        # Check if restaurant exists
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        # Check if user already has a review for this restaurant
        existing_review = Review.objects.filter(
            restaurant=restaurant,
            user=request.user
        ).first()
        
        if existing_review:
            return Response(
                {'error': 'You have already reviewed this restaurant. You can update your existing review.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create serializer with request data
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Save review with restaurant and user
                    review = serializer.save(restaurant=restaurant, user=request.user)
                    # Update restaurant rating
                    self.update_restaurant_rating(restaurant)
                    
                return Response(
                    ReviewSerializer(review, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': f'Failed to create review: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update_restaurant_rating(self, restaurant):
        """Update restaurant's average rating"""
        review_stats = restaurant.reviews.aggregate(
            total_reviews=Count('id'),
            average_rating=Avg('rating')
        )
        
        restaurant.total_reviews = review_stats['total_reviews'] or 0
        restaurant.rating = round(review_stats['average_rating'] or 0, 2)
        restaurant.save(update_fields=['total_reviews', 'rating'])

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific review"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.select_related('user', 'restaurant')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ReviewUpdateSerializer
        return ReviewSerializer
    
    def get_object(self):
        review = super().get_object()
        # Ensure user can only access their own review for update/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if review.user != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only modify your own reviews.")
        return review
    
    def perform_update(self, serializer):
        review = serializer.save()
        # Update restaurant rating after review update
        self.update_restaurant_rating(review.restaurant)
    
    def perform_destroy(self, instance):
        restaurant = instance.restaurant
        instance.delete()
        # Update restaurant rating after review deletion
        self.update_restaurant_rating(restaurant)
    
    def update_restaurant_rating(self, restaurant):
        """Update restaurant's average rating"""
        review_stats = restaurant.reviews.aggregate(
            total_reviews=Count('id'),
            average_rating=Avg('rating')
        )
        
        restaurant.total_reviews = review_stats['total_reviews'] or 0
        restaurant.rating = round(review_stats['average_rating'] or 0, 2)
        restaurant.save(update_fields=['total_reviews', 'rating'])

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_reviews(request):
    """Get all reviews by the current user"""
    reviews = Review.objects.filter(user=request.user).select_related('restaurant')
    serializer = ReviewSerializer(reviews, many=True, context={'request': request})
    
    return Response({
        'total_reviews': reviews.count(),
        'reviews': serializer.data
    })
