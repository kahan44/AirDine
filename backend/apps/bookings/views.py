from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Booking, TimeSlot, BookingHistory, DateTimeSlot
from .serializers import (
    BookingListSerializer, BookingDetailSerializer, 
    BookingCreateSerializer, TimeSlotSerializer, BookingHistorySerializer,
    DateTimeSlotSerializer
)
from apps.restaurant.models import Restaurant


class BookingListCreateView(generics.ListCreateAPIView):
    """List user's bookings and create new bookings"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingListSerializer
    
    def perform_create(self, serializer):
        booking = serializer.save()
        
        # Create booking history entry
        BookingHistory.objects.create(
            booking=booking,
            status_from='',
            status_to='pending',
            changed_by=self.request.user,
            notes='Booking created'
        )


class BookingDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update booking details"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingDetailSerializer
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel a booking and remove it from database"""
    try:
        booking = get_object_or_404(
            Booking, 
            id=booking_id, 
            user=request.user
        )
        
        # Check if booking can be cancelled
        if not booking.can_be_cancelled():
            return Response({
                'error': 'Booking cannot be cancelled. It may be too close to the booking time or already completed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store booking reference for response
        booking_reference = booking.booking_reference
        
        # Delete the booking from database (this will also delete related history)
        booking.delete()
        
        return Response({
            'message': 'Booking cancelled and removed successfully',
            'booking_reference': booking_reference
        })
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def restaurant_time_slots(request, restaurant_id):
    """Get available time slots for a restaurant on a specific date"""
    try:
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        date_str = request.GET.get('date')
        
        if not date_str:
            return Response({
                'error': 'Date parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Don't allow past dates
        today = timezone.localtime().date()
        if date < today:
            return Response({
                'error': 'Cannot get slots for past dates'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Don't allow dates more than 4 days in advance
        max_date = today + timedelta(days=3)
        if date > max_date:
            return Response({
                'error': f'Cannot book more than 4 days in advance. Last available date: {max_date}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if date-specific slots exist, if not create them from template
        date_time_slots = DateTimeSlot.objects.filter(
            restaurant=restaurant,
            date=date,
            is_active=True
        )
        
        # If no date-specific slots exist, create them from the template
        if not date_time_slots.exists():
            template_slots = TimeSlot.objects.filter(
                restaurant=restaurant,
                is_active=True
            )
            
            # Create date-specific slots from template
            for template_slot in template_slots:
                DateTimeSlot.objects.get_or_create(
                    restaurant=restaurant,
                    date=date,
                    time=template_slot.time,
                    defaults={
                        'max_capacity': template_slot.max_capacity,
                        'is_active': True
                    }
                )
            
            # Re-fetch the created slots
            date_time_slots = DateTimeSlot.objects.filter(
                restaurant=restaurant,
                date=date,
                is_active=True
            )
        
        serializer = DateTimeSlotSerializer(
            date_time_slots, 
            many=True
        )
        
        return Response({
            'restaurant': {
                'id': restaurant.id,
                'name': restaurant.name
            },
            'date': date,
            'time_slots': serializer.data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def booking_history(request, booking_id):
    """Get booking history"""
    try:
        booking = get_object_or_404(
            Booking, 
            id=booking_id, 
            user=request.user
        )
        
        history = BookingHistory.objects.filter(booking=booking)
        serializer = BookingHistorySerializer(history, many=True)
        
        return Response({
            'booking_reference': booking.booking_reference,
            'history': serializer.data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_booking_date_info(request):
    """Get current date and valid booking date range - no authentication required"""
    # Use Django's timezone-aware current date in the configured timezone
    today = timezone.localtime().date() + timedelta(days=1)
    max_date = today + timedelta(days=3)
    
    return Response({
        'today': today.isoformat(),
        'min_date': today.isoformat(),
        'max_date': max_date.isoformat(),
        'valid_dates': [
            (today + timedelta(days=i)).isoformat() 
            for i in range(4)
        ]
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_bookings(request):
    """Get user's upcoming bookings"""
    try:
        today = timezone.now().date()
        upcoming = Booking.objects.filter(
            user=request.user,
            booking_date__gte=today,
            status__in=['pending', 'confirmed']
        ).order_by('booking_date', 'time_slot__time')
        
        serializer = BookingListSerializer(upcoming, many=True)
        
        return Response({
            'count': upcoming.count(),
            'bookings': serializer.data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def booking_statistics(request):
    """Get user's booking statistics"""
    try:
        user_bookings = Booking.objects.filter(user=request.user)
        
        stats = {
            'total_bookings': user_bookings.count(),
            'confirmed_bookings': user_bookings.filter(status='confirmed').count(),
            'pending_bookings': user_bookings.filter(status='pending').count(),
            'cancelled_bookings': user_bookings.filter(status='cancelled').count(),
            'completed_bookings': user_bookings.filter(status='completed').count(),
        }
        
        # Recent bookings (last 30 days)
        recent_date = timezone.now().date() - timedelta(days=30)
        recent_bookings = user_bookings.filter(created_at__date__gte=recent_date)
        
        stats['recent_bookings'] = recent_bookings.count()
        
        return Response(stats)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
