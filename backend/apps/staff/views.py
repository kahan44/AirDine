from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, Q
from datetime import datetime, timedelta

from apps.staff.models import RestaurantAdmin
from apps.staff.serializers import (
	RestaurantAdminProfileSerializer,
	BookingStatusUpdateSerializer,
	RestaurantSummarySerializer,
)
from apps.staff.permissions import IsRestaurantAdmin
from apps.bookings.models import Booking, BookingHistory
from apps.bookings.serializers import BookingListSerializer
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer
from apps.offers.models import Offer
from apps.offers.serializers import OfferSerializer
from apps.restaurant.models import Restaurant


def _get_admin_restaurant(user):
	admin_profile = get_object_or_404(RestaurantAdmin, user=user)
	return admin_profile.restaurant


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_me(request):
	admin_profile = get_object_or_404(RestaurantAdmin, user=request.user)
	return Response(RestaurantAdminProfileSerializer(admin_profile).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_overview(request):
	restaurant = _get_admin_restaurant(request.user)
	now = timezone.now()
	today = now.date()
	
	# Define time periods for comparison
	current_week_start = today - timedelta(days=today.weekday())
	last_week_start = current_week_start - timedelta(days=7)
	last_week_end = current_week_start - timedelta(days=1)
	current_month_start = today.replace(day=1)
	if current_month_start.month == 1:
		last_month_start = current_month_start.replace(year=current_month_start.year - 1, month=12)
	else:
		last_month_start = current_month_start.replace(month=current_month_start.month - 1)
	last_month_end = current_month_start - timedelta(days=1)

	# Current period stats
	bookings = Booking.objects.filter(restaurant=restaurant)
	current_stats = {
		'total_bookings': bookings.count(),
		'pending': bookings.filter(status='pending').count(),
		'confirmed': bookings.filter(status='confirmed').count(),
		'completed': bookings.filter(status='completed').count(),
		'cancelled': bookings.filter(status='cancelled').count(),
	}

	# Previous period stats for trends
	last_week_bookings = bookings.filter(
		created_at__date__gte=last_week_start,
		created_at__date__lte=last_week_end
	)
	current_week_bookings = bookings.filter(created_at__date__gte=current_week_start)
	
	last_month_bookings = bookings.filter(
		created_at__date__gte=last_month_start,
		created_at__date__lte=last_month_end
	)
	current_month_bookings = bookings.filter(created_at__date__gte=current_month_start)

	# Calculate trends
	trends = {
		'total_bookings': {
			'current': current_week_bookings.count(),
			'previous': last_week_bookings.count(),
		},
		'confirmed': {
			'current': current_week_bookings.filter(status='confirmed').count(),
			'previous': last_week_bookings.filter(status='confirmed').count(),
		},
		'completed': {
			'current': current_week_bookings.filter(status='completed').count(),
			'previous': last_week_bookings.filter(status='completed').count(),
		},
		'cancelled': {
			'current': current_week_bookings.filter(status='cancelled').count(),
			'previous': last_week_bookings.filter(status='cancelled').count(),
		}
	}

	# Reviews stats
	reviews = Review.objects.filter(restaurant=restaurant)
	current_stats['reviews_count'] = reviews.count()
	current_stats['avg_rating'] = restaurant.average_rating or 0

	# Review trends
	current_week_reviews = reviews.filter(created_at__date__gte=current_week_start)
	last_week_reviews = reviews.filter(
		created_at__date__gte=last_week_start,
		created_at__date__lte=last_week_end
	)
	
	trends['reviews_count'] = {
		'current': current_week_reviews.count(),
		'previous': last_week_reviews.count(),
	}

	# Offers count
	current_stats['active_offers'] = Offer.objects.filter(restaurant=restaurant, is_active=True).count()

	# Recent Activity (last 10 activities)
	recent_activity = []
	
	# Recent booking status changes
	recent_booking_history = BookingHistory.objects.filter(
		booking__restaurant=restaurant
	).select_related('booking', 'changed_by').order_by('-changed_at')[:5]
	
	for history in recent_booking_history:
		recent_activity.append({
			'type': 'booking_status_change',
			'message': f"Booking {history.booking.booking_reference} status changed from {history.status_from} to {history.status_to}",
			'timestamp': history.changed_at,
			'details': {
				'booking_reference': history.booking.booking_reference,
				'customer_name': history.booking.customer_name,
				'status_from': history.status_from,
				'status_to': history.status_to,
				'changed_by': history.changed_by.get_full_name() if history.changed_by else 'System'
			}
		})

	# Recent new bookings
	recent_bookings = bookings.filter(
		created_at__gte=now - timedelta(days=7)
	).order_by('-created_at')[:5]
	
	for booking in recent_bookings:
		recent_activity.append({
			'type': 'new_booking',
			'message': f"New booking received from {booking.customer_name} for {booking.booking_date}",
			'timestamp': booking.created_at,
			'details': {
				'booking_reference': booking.booking_reference,
				'customer_name': booking.customer_name,
				'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
				'party_size': booking.party_size,
				'status': booking.status
			}
		})

	# Recent reviews
	recent_reviews = reviews.filter(
		created_at__gte=now - timedelta(days=7)
	).select_related('user').order_by('-created_at')[:3]
	
	for review in recent_reviews:
		recent_activity.append({
			'type': 'new_review',
			'message': f"New {review.rating}-star review from {review.user.get_full_name() if review.user else 'Guest'}",
			'timestamp': review.created_at,
			'details': {
				'rating': review.rating,
				'reviewer': review.user.get_full_name() if review.user else 'Guest',
				'comment': review.comment[:100] + '...' if len(review.comment) > 100 else review.comment
			}
		})

	# Sort recent activity by timestamp and limit to 10
	recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
	recent_activity = recent_activity[:10]

	# Generate insights
	insights = {}
	
	# Booking completion rate insight (based on completed bookings)
	total_this_month = current_month_bookings.count()
	completed_this_month = current_month_bookings.filter(status='completed').count()
	if total_this_month > 0:
		completion_rate = round((completed_this_month / total_this_month) * 100, 1)
		insights['booking_rate'] = f"{completion_rate}% booking completion rate this month"
		insights['completion_rate_value'] = completion_rate
		insights['completion_rate_description'] = "booking completion rate this month"
	
	# Peak hours insight
	booking_hours = current_month_bookings.values_list('time_slot__time', flat=True)
	if booking_hours:
		from collections import Counter
		hour_counts = Counter([time.hour for time in booking_hours if time])
		if hour_counts:
			peak_hour = hour_counts.most_common(1)[0][0]
			peak_end = peak_hour + 2
			insights['peak_hours'] = f"{peak_hour}:00-{peak_end}:00 are your busiest hours"
	
	# Average rating insight
	if restaurant.average_rating:
		if restaurant.average_rating >= 4.5:
			insights['rating_trend'] = f"Excellent {restaurant.average_rating:.1f}★ average rating!"
		elif restaurant.average_rating >= 4.0:
			insights['rating_trend'] = f"Good {restaurant.average_rating:.1f}★ average rating"
		else:
			insights['rating_trend'] = f"{restaurant.average_rating:.1f}★ rating - room for improvement"
	
	# Recent performance insight
	if trends['total_bookings']['current'] > trends['total_bookings']['previous']:
		increase = trends['total_bookings']['current'] - trends['total_bookings']['previous']
		insights['weekly_trend'] = f"Bookings increased by {increase} this week!"
	elif trends['total_bookings']['current'] < trends['total_bookings']['previous']:
		decrease = trends['total_bookings']['previous'] - trends['total_bookings']['current']
		insights['weekly_trend'] = f"Bookings decreased by {decrease} this week"
	else:
		insights['weekly_trend'] = "Booking levels remain steady"

	return Response({
		'restaurant': RestaurantSummarySerializer(restaurant).data,
		'stats': current_stats,
		'trends': trends,
		'recent_activity': recent_activity,
		'insights': insights,
	})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_bookings(request):
	restaurant = _get_admin_restaurant(request.user)
	status_filter = request.GET.get('status')
	qs = Booking.objects.filter(restaurant=restaurant)
	if status_filter:
		qs = qs.filter(status=status_filter)
	qs = qs.order_by('-created_at')
	return Response(BookingListSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_update_booking_status(request, booking_id):
	restaurant = _get_admin_restaurant(request.user)
	booking = get_object_or_404(Booking, id=booking_id, restaurant=restaurant)

	serializer = BookingStatusUpdateSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)
	new_status = serializer.validated_data['status']
	notes = serializer.validated_data.get('notes', '')

	# Only allow transitions to confirmed or completed
	prev_status = booking.status
	if new_status == 'confirmed':
		booking.confirm()
	elif new_status == 'completed':
		booking.status = 'completed'
		booking.save(update_fields=['status', 'updated_at'])
	else:
		return Response({'error': 'Invalid status transition'}, status=status.HTTP_400_BAD_REQUEST)

	BookingHistory.objects.create(
		booking=booking,
		status_from=prev_status,
		status_to=new_status,
		changed_by=request.user,
		notes=notes or f"Admin changed status to {new_status}"
	)

	return Response({'message': 'Status updated', 'booking': BookingListSerializer(booking).data})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_reviews(request):
	restaurant = _get_admin_restaurant(request.user)
	qs = Review.objects.filter(restaurant=restaurant).order_by('-created_at')
	return Response(ReviewSerializer(qs, many=True, context={'request': request}).data)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_offers_list_create(request):
	restaurant = _get_admin_restaurant(request.user)
	if request.method == 'GET':
		qs = Offer.objects.filter(restaurant=restaurant).order_by('-created_at')
		return Response(OfferSerializer(qs, many=True).data)

	# POST - create
	data = request.data.copy()
	data['restaurant'] = str(restaurant.id)
	
	# Clean the data to handle frontend validation issues
	if 'max_uses_per_user' in data and (data['max_uses_per_user'] is None or data['max_uses_per_user'] < 1):
		data['max_uses_per_user'] = 1  # Set to default minimum value
	
	# Using a basic serializer with ModelSerializer requires writable restaurant;
	# for simplicity, recreate a serializer allowing restaurant id.
	class _WritableOfferSerializer(OfferSerializer):
		class Meta(OfferSerializer.Meta):
			read_only_fields = []

	ser = _WritableOfferSerializer(data=data)
	if ser.is_valid():
		offer = Offer.objects.create(
			restaurant=restaurant,
			title=ser.validated_data.get('title'),
			description=ser.validated_data.get('description'),
			offer_type=ser.validated_data.get('offer_type'),
			discount_percentage=ser.validated_data.get('discount_percentage'),
			discount_amount=ser.validated_data.get('discount_amount'),
			valid_from=ser.validated_data.get('valid_from'),
			valid_until=ser.validated_data.get('valid_until'),
			valid_days=ser.validated_data.get('valid_days', []),
			minimum_order_amount=ser.validated_data.get('minimum_order_amount'),
			maximum_discount_amount=ser.validated_data.get('maximum_discount_amount'),
			max_uses=ser.validated_data.get('max_uses'),
			max_uses_per_user=ser.validated_data.get('max_uses_per_user', 1),
			current_uses=ser.validated_data.get('current_uses', 0),
			is_active=ser.validated_data.get('is_active', True),
			is_featured=ser.validated_data.get('is_featured', False),
			terms_and_conditions=ser.validated_data.get('terms_and_conditions', ''),
			image=ser.validated_data.get('image'),
		)
		return Response(OfferSerializer(offer).data, status=status.HTTP_201_CREATED)
	else:
		# Debug: Print validation errors
		print("Offer creation validation errors:", ser.errors)
		print("Request data received:", request.data)
		print("Data being validated:", data)
	return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_offer_update_delete(request, offer_id):
	restaurant = _get_admin_restaurant(request.user)
	offer = get_object_or_404(Offer, id=offer_id, restaurant=restaurant)
	if request.method == 'DELETE':
		offer.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)
	# Update
	class _WritableOfferSerializer(OfferSerializer):
		class Meta(OfferSerializer.Meta):
			read_only_fields = []
	ser = _WritableOfferSerializer(offer, data=request.data, partial=True)
	if ser.is_valid():
		ser.save()
		return Response(ser.data)
	return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_restaurant_get_update(request):
	restaurant = _get_admin_restaurant(request.user)
	if request.method == 'GET':
		return Response(RestaurantSummarySerializer(restaurant).data)
	# Update
	class _WritableRestaurantSerializer(RestaurantSummarySerializer):
		class Meta(RestaurantSummarySerializer.Meta):
			read_only_fields = []
	ser = _WritableRestaurantSerializer(restaurant, data=request.data, partial=True)
	if ser.is_valid():
		ser.save()
		return Response(ser.data)
	return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_redeem_offer_code(request):
	"""Admin endpoint to redeem offer activation codes"""
	from apps.offers.models import OfferActivation
	from apps.offers.serializers import RedeemOfferSerializer, OfferActivationSerializer
	
	restaurant = _get_admin_restaurant(request.user)
	
	serializer = RedeemOfferSerializer(data=request.data)
	if serializer.is_valid():
		try:
			activation_code = serializer.validated_data['activation_code']
			activation = OfferActivation.objects.select_related('offer', 'user').get(
				activation_code=activation_code,
				offer__restaurant=restaurant  # Ensure the offer belongs to this restaurant
			)
			
			if not activation.is_valid:
				if activation.is_expired:
					return Response(
						{'error': 'Activation code has expired'}, 
						status=status.HTTP_400_BAD_REQUEST
					)
				elif activation.status == 'redeemed':
					return Response(
						{'error': 'Activation code has already been redeemed'}, 
						status=status.HTTP_400_BAD_REQUEST
					)
				else:
					return Response(
						{'error': 'Activation code is not valid'}, 
						status=status.HTTP_400_BAD_REQUEST
					)
			
			# Redeem the code
			activation.redeem(request.user)
			
			response_serializer = OfferActivationSerializer(activation)
			return Response({
				'message': 'Offer code redeemed successfully!',
				'activation': response_serializer.data
			})
			
		except OfferActivation.DoesNotExist:
			return Response(
				{'error': 'Invalid activation code or code does not belong to your restaurant'}, 
				status=status.HTTP_404_NOT_FOUND
			)
		except ValueError as e:
			return Response(
				{'error': str(e)}, 
				status=status.HTTP_400_BAD_REQUEST
			)
	
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsRestaurantAdmin])
def admin_offer_activations(request):
	"""Get offer activations for admin dashboard"""
	from apps.offers.models import OfferActivation
	from apps.offers.serializers import OfferActivationSerializer
	
	restaurant = _get_admin_restaurant(request.user)
	
	activations = OfferActivation.objects.filter(
		offer__restaurant=restaurant
	).select_related('offer', 'user').order_by('-created_at')
	
	# Filter by status if provided
	status_filter = request.query_params.get('status')
	if status_filter:
		activations = activations.filter(status=status_filter)
	
	# Limit to recent activations
	activations = activations[:50]
	
	serializer = OfferActivationSerializer(activations, many=True)
	return Response(serializer.data)
