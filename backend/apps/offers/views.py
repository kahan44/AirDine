# apps/offers/views.py
from django.utils import timezone
from django.db.models import Q, F, Prefetch
from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Offer, OfferUsage, OfferActivation
from .serializers import (
    OfferSerializer, OfferListSerializer, 
    RestaurantOfferSerializer, OfferUsageSerializer,
    OfferActivationSerializer, RedeemOfferSerializer
)
from apps.restaurant.models import Restaurant


class OfferFilter(django_filters.FilterSet):
    """Custom filter for offers"""
    cuisine = django_filters.CharFilter(field_name='restaurant__cuisine', lookup_expr='icontains')
    restaurant_name = django_filters.CharFilter(field_name='restaurant__name', lookup_expr='icontains')
    offer_type = django_filters.MultipleChoiceFilter(choices=Offer.OFFER_TYPES)
    is_featured = django_filters.BooleanFilter()
    valid_today = django_filters.BooleanFilter(method='filter_valid_today')
    min_discount = django_filters.NumberFilter(method='filter_min_discount')
    max_discount = django_filters.NumberFilter(method='filter_max_discount')
    
    class Meta:
        model = Offer
        fields = ['cuisine', 'restaurant_name', 'offer_type', 'is_featured']

    def filter_valid_today(self, queryset, name, value):
        if value:
            now = timezone.now()
            return queryset.filter(
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now
            )
        return queryset

    def filter_min_discount(self, queryset, name, value):
        return queryset.filter(
            Q(discount_percentage__gte=value) | Q(discount_amount__gte=value)
        )

    def filter_max_discount(self, queryset, name, value):
        return queryset.filter(
            Q(discount_percentage__lte=value) | Q(discount_amount__lte=value)
        )


class OfferListView(generics.ListAPIView):
    """List all active offers with filtering and search"""
    serializer_class = OfferListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OfferFilter
    search_fields = ['title', 'description', 'restaurant__name', 'restaurant__cuisine']
    ordering_fields = ['created_at', 'valid_until', 'discount_percentage', 'discount_amount']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        now = timezone.now()
        
        # Update expired activations first
        OfferActivation.update_expired_activations()
        
        queryset = Offer.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).filter(
            Q(max_uses__isnull=True) | Q(current_uses__lt=F('max_uses'))
        ).select_related('restaurant')
        
        # If user is authenticated, filter out offers they've already used up to their limit
        # and offers that have expired activations
        if self.request.user.is_authenticated:
            user = self.request.user
            
            # Get offers where user has reached their personal usage limit
            # (counting both actual usage and expired activations)
            used_up_offers = []
            
            for offer in queryset:
                total_usage_count = OfferUsage.objects.filter(
                    offer=offer,
                    user=user
                ).count()  # This includes both 'used' and 'expired' status
                
                if total_usage_count >= offer.max_uses_per_user:
                    used_up_offers.append(offer.id)
            
            # Exclude offers the user has used up (including expired activations)
            queryset = queryset.exclude(id__in=used_up_offers)
        
        return queryset.distinct()


class FeaturedOffersView(generics.ListAPIView):
    """List featured offers"""
    serializer_class = OfferListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        now = timezone.now()
        queryset = Offer.objects.filter(
            is_active=True,
            is_featured=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).filter(
            Q(max_uses__isnull=True) | Q(current_uses__lt=F('max_uses'))
        ).select_related('restaurant')
        
        # If user is authenticated, filter out offers they've already used up to their limit
        if self.request.user.is_authenticated:
            user = self.request.user
            # Get offers where user has reached their personal usage limit
            used_up_offers = []
            for offer in queryset:
                user_usage_count = OfferUsage.objects.filter(
                    offer=offer,
                    user=user
                ).count()
                if user_usage_count >= offer.max_uses_per_user:
                    used_up_offers.append(offer.id)
            
            # Exclude offers the user has used up
            queryset = queryset.exclude(id__in=used_up_offers)
        
        return queryset[:6]


class OfferDetailView(generics.RetrieveAPIView):
    """Get detailed offer information"""
    serializer_class = OfferSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Offer.objects.filter(
            is_active=True
        ).filter(
            Q(max_uses__isnull=True) | Q(current_uses__lt=F('max_uses'))
        ).select_related('restaurant')


class RestaurantOffersView(generics.ListAPIView):
    """Get all offers for a specific restaurant"""
    serializer_class = RestaurantOfferSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        now = timezone.now()
        queryset = Offer.objects.filter(
            restaurant_id=restaurant_id,
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).filter(
            Q(max_uses__isnull=True) | Q(current_uses__lt=F('max_uses'))
        )
        
        # If user is authenticated, filter out offers they've already used up to their limit
        if self.request.user.is_authenticated:
            user = self.request.user
            # Get offers where user has reached their personal usage limit
            used_up_offers = []
            for offer in queryset:
                user_usage_count = OfferUsage.objects.filter(
                    offer=offer,
                    user=user
                ).count()
                if user_usage_count >= offer.max_uses_per_user:
                    used_up_offers.append(offer.id)
            
            # Exclude offers the user has used up
            queryset = queryset.exclude(id__in=used_up_offers)
        
        return queryset.order_by('-is_featured', '-created_at')


@api_view(['GET'])
@permission_classes([AllowAny])
def offer_stats(request):
    """Get offer statistics"""
    now = timezone.now()
    
    total_offers = Offer.objects.filter(is_active=True).count()
    active_offers = Offer.objects.filter(
        is_active=True,
        valid_from__lte=now,
        valid_until__gte=now
    ).filter(
        Q(max_uses__isnull=True) | Q(current_uses__lt=F('max_uses'))
    ).count()
    featured_offers = Offer.objects.filter(
        is_active=True,
        is_featured=True,
        valid_from__lte=now,
        valid_until__gte=now
    ).filter(
        Q(max_uses__isnull=True) | Q(current_uses__lt=F('max_uses'))
    ).count()
    
    # Get unique restaurants with offers
    restaurants_with_offers = Restaurant.objects.filter(
        offers__is_active=True,
        offers__valid_from__lte=now,
        offers__valid_until__gte=now
    ).filter(
        Q(offers__max_uses__isnull=True) | Q(offers__current_uses__lt=F('offers__max_uses'))
    ).distinct().count()
    
    # Get offer types distribution
    offer_types = {}
    for offer_type, label in Offer.OFFER_TYPES:
        count = Offer.objects.filter(
            is_active=True,
            offer_type=offer_type,
            valid_from__lte=now,
            valid_until__gte=now
        ).count()
        if count > 0:
            offer_types[offer_type] = {
                'label': label,
                'count': count
            }
    
    return Response({
        'total_offers': total_offers,
        'active_offers': active_offers,
        'featured_offers': featured_offers,
        'restaurants_with_offers': restaurants_with_offers,
        'offer_types': offer_types
    })


@api_view(['GET'])
def trending_offers(request):
    """Get trending offers based on usage"""
    now = timezone.now()
    
    trending = Offer.objects.filter(
        is_active=True,
        valid_from__lte=now,
        valid_until__gte=now,
        current_uses__gt=0
    ).select_related('restaurant').order_by('-current_uses', '-created_at')[:10]
    
    serializer = OfferListSerializer(trending, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_offer_usage(request):
    """Get user's offer usage history"""
    usage = OfferUsage.objects.filter(
        user=request.user
    ).select_related('offer', 'offer__restaurant').order_by('-used_at')
    
    serializer = OfferUsageSerializer(usage, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_offer(request, offer_id):
    """Use an offer (for testing purposes)"""
    try:
        offer = Offer.objects.get(id=offer_id, is_active=True)
        
        if not offer.is_valid:
            return Response(
                {'error': 'Offer is not valid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not offer.can_be_used_by_user(request.user):
            return Response(
                {'error': 'You have exceeded the usage limit for this offer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create usage record
        order_amount = request.data.get('order_amount', 0)
        discount_applied = min(
            float(order_amount) * (float(offer.discount_percentage or 0) / 100) if offer.offer_type == 'percentage' else float(offer.discount_amount or 0),
            float(offer.maximum_discount_amount or float('inf'))
        )
        
        OfferUsage.objects.create(
            offer=offer,
            user=request.user,
            used_at=timezone.now(),  # Set current time for actual usage
            order_amount=order_amount,
            discount_applied=discount_applied,
            status='used'  # Mark as actually used
        )
        
        offer.use_offer()
        
        return Response({
            'message': 'Offer used successfully',
            'discount_applied': discount_applied
        })
        
    except Offer.DoesNotExist:
        return Response(
            {'error': 'Offer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def activate_offer(request, offer_id):
    """Activate an offer and generate activation code"""
    try:
        # Update expired activations first
        OfferActivation.update_expired_activations()
        
        offer = Offer.objects.get(id=offer_id)
        
        if not offer.is_valid:
            return Response(
                {'error': 'Offer is not currently valid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For testing, create a mock user if not authenticated
        user = request.user if request.user.is_authenticated else None
        if not user:
            # For testing purposes, use a default user or create one
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user, created = User.objects.get_or_create(
                email='test@example.com',
                defaults={
                    'first_name': 'Test',
                    'last_name': 'User',
                    'phone': '1234567890'
                }
            )
        
        if not offer.can_be_used_by_user(user):
            return Response(
                {'error': 'You have already used this offer or exceeded usage limit'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already has a pending activation for this offer
        existing_activation = OfferActivation.objects.filter(
            offer=offer,
            user=user,
            status='pending'
        ).first()
        
        if existing_activation:
            # Check if it's expired and update if needed
            existing_activation.check_and_update_expiration()
            # Refresh from database
            existing_activation.refresh_from_db()
            
            if existing_activation.is_valid:
                serializer = OfferActivationSerializer(existing_activation)
                return Response({
                    'message': 'You already have an active code for this offer',
                    'activation': serializer.data
                })
        
        # Create new activation
        activation = OfferActivation.objects.create(
            offer=offer,
            user=user
        )
        
        serializer = OfferActivationSerializer(activation)
        return Response({
            'message': 'Offer activated successfully! Use this code within 30 minutes.',
            'activation': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Offer.DoesNotExist:
        return Response(
            {'error': 'Offer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activations(request):
    """Get user's offer activations"""
    # Update expired activations first
    OfferActivation.update_expired_activations()
    
    activations = OfferActivation.objects.filter(
        user=request.user
    ).select_related('offer', 'offer__restaurant').order_by('-created_at')[:20]
    
    serializer = OfferActivationSerializer(activations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_redeemed_offers(request):
    """Get user's redeemed offers (offers they have actually used) and expired activations"""
    print(f"DEBUG: user_redeemed_offers called by user: {request.user}")
    
    # Update expired activations first
    OfferActivation.update_expired_activations()
    
    # Get all offer usage records for this user (both used and expired)
    usage_records = OfferUsage.objects.filter(
        user=request.user
    ).select_related('offer', 'offer__restaurant').order_by('-used_at')
    
    print(f"DEBUG: Found {usage_records.count()} usage records for user {request.user}")
    
    # Group by offer to show unique offers with usage info
    offers_data = []
    seen_offers = set()
    
    for usage in usage_records:
        if usage.offer.id not in seen_offers:
            # Get total usage count for this offer by this user (only actual usage, not expired)
            actual_usage_count = OfferUsage.objects.filter(
                user=request.user,
                offer=usage.offer,
                status='used'
            ).count()
            
            # Get expired count
            expired_count = OfferUsage.objects.filter(
                user=request.user,
                offer=usage.offer,
                status='expired'
            ).count()
            
            # Get the latest usage date (any status)
            latest_usage = OfferUsage.objects.filter(
                user=request.user,
                offer=usage.offer
            ).order_by('-used_at').first()
            
            # Determine primary status (used takes precedence over expired)
            primary_status = 'used' if actual_usage_count > 0 else 'expired'
            
            offer_data = {
                'id': usage.offer.id,
                'title': usage.offer.title,
                'description': usage.offer.description,
                'offer_type': usage.offer.offer_type,
                'discount_percentage': usage.offer.discount_percentage,
                'discount_amount': usage.offer.discount_amount,
                'max_uses_per_user': usage.offer.max_uses_per_user,
                'restaurant': {
                    'id': str(usage.offer.restaurant.id),
                    'name': usage.offer.restaurant.name,
                    'cuisine': usage.offer.restaurant.cuisine,
                } if usage.offer.restaurant else None,
                'usage_count': actual_usage_count,
                'expired_count': expired_count,
                'last_used': latest_usage.used_at if latest_usage else None,
                'first_used': usage.used_at,
                'status': primary_status
            }
            
            # Add expiration details if applicable
            if expired_count > 0:
                latest_expired = OfferUsage.objects.filter(
                    user=request.user,
                    offer=usage.offer,
                    status='expired'
                ).order_by('-used_at').first()
                if latest_expired:
                    offer_data['expired_at'] = latest_expired.used_at
            
            offers_data.append(offer_data)
            seen_offers.add(usage.offer.id)
    
    # Sort by most recent activity (used_at)
    offers_data.sort(key=lambda x: x['last_used'] or x['first_used'], reverse=True)
    
    print(f"DEBUG: Returning {len(offers_data)} unique offers with usage records")
    return Response({
        'count': len(offers_data),
        'results': offers_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_offer_code(request):
    """Redeem an offer activation code (Admin only)"""
    # Check if user is admin/staff
    if not (request.user.is_staff or hasattr(request.user, 'restaurant_admin')):
        return Response(
            {'error': 'Only restaurant admins can redeem offer codes'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Update expired activations first
    OfferActivation.update_expired_activations()
    
    serializer = RedeemOfferSerializer(data=request.data)
    if serializer.is_valid():
        try:
            activation_code = serializer.validated_data['activation_code']
            activation = OfferActivation.objects.get(activation_code=activation_code)
            
            # Double-check expiration status
            activation.check_and_update_expiration()
            activation.refresh_from_db()
            
            # Redeem the code
            activation.redeem(request.user)
            
            response_serializer = OfferActivationSerializer(activation)
            return Response({
                'message': 'Offer code redeemed successfully!',
                'activation': response_serializer.data
            })
            
        except OfferActivation.DoesNotExist:
            return Response(
                {'error': 'Invalid activation code'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_activations(request):
    """Get all offer activations for admin (restaurant-specific)"""
    # Check if user is admin/staff
    if not (request.user.is_staff or hasattr(request.user, 'restaurant_admin')):
        return Response(
            {'error': 'Only restaurant admins can view activations'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Update expired activations first
    OfferActivation.update_expired_activations()
    
    # If user has a restaurant, filter by that restaurant
    restaurant = None
    if hasattr(request.user, 'restaurant_admin'):
        restaurant = request.user.restaurant_admin.restaurant
    
    activations = OfferActivation.objects.select_related(
        'offer', 'offer__restaurant', 'user'
    ).order_by('-created_at')
    
    if restaurant:
        activations = activations.filter(offer__restaurant=restaurant)
    
    # Filter by status if provided
    status_filter = request.query_params.get('status')
    if status_filter:
        activations = activations.filter(status=status_filter)
    
    # Paginate if needed
    activations = activations[:50]  # Limit to 50 recent activations
    
    serializer = OfferActivationSerializer(activations, many=True)
    return Response(serializer.data)
