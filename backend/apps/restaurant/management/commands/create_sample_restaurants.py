# apps/restaurant/management/commands/create_sample_restaurants.py
from django.core.management.base import BaseCommand
from apps.restaurant.models import Restaurant
from datetime import time
from decimal import Decimal

class Command(BaseCommand):
    help = 'Creates sample restaurant data for development'

    def handle(self, *args, **options):
        # Clear existing data
        Restaurant.objects.all().delete()
        
        sample_restaurants = [
            {
                'name': 'The Golden Spoon',
                'description': 'Authentic Italian cuisine with a modern twist. Our chefs use only the finest ingredients imported directly from Italy.',
                'cuisine': 'Italian',
                'address': '123 Main Street, Downtown, City 12345',
                'phone': '+1 (555) 123-4567',
                'email': 'info@goldenspoon.com',
                'image': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
                'rating': Decimal('4.8'),
                'total_reviews': 245,
                'price_range': '$$$',
                'opening_time': time(11, 0),
                'closing_time': time(23, 0),
                'is_featured': True,
            },
            {
                'name': 'Sakura Sushi',
                'description': 'Fresh sushi and Japanese delicacies prepared by master chefs with over 20 years of experience.',
                'cuisine': 'Japanese',
                'address': '456 Oak Avenue, Midtown, City 12346',
                'phone': '+1 (555) 234-5678',
                'email': 'hello@sakurasushi.com',
                'image': 'https://images.unsplash.com/photo-1579027989054-b11916a5b519?w=800&h=600&fit=crop',
                'rating': Decimal('4.6'),
                'total_reviews': 189,
                'price_range': '$$$$',
                'opening_time': time(17, 0),
                'closing_time': time(22, 30),
                'is_featured': True,
            },
            {
                'name': 'Ocean Breeze',
                'description': 'Waterfront seafood restaurant offering the freshest catch of the day with stunning ocean views.',
                'cuisine': 'Seafood',
                'address': '789 Harbor Drive, Waterfront, City 12347',
                'phone': '+1 (555) 345-6789',
                'email': 'reservations@oceanbreeze.com',
                'image': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
                'rating': Decimal('4.7'),
                'total_reviews': 312,
                'price_range': '$$$$',
                'opening_time': time(12, 0),
                'closing_time': time(22, 0),
                'is_featured': True,
            },
            {
                'name': 'Green Garden',
                'description': 'Farm-to-table vegetarian restaurant focusing on organic, locally-sourced ingredients.',
                'cuisine': 'Vegetarian',
                'address': '321 Garden Street, Green District, City 12348',
                'phone': '+1 (555) 456-7890',
                'email': 'info@greengarden.com',
                'image': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop',
                'rating': Decimal('4.5'),
                'total_reviews': 156,
                'price_range': '$$',
                'opening_time': time(10, 0),
                'closing_time': time(21, 0),
                'is_featured': False,
            },
            {
                'name': 'Spice Route',
                'description': 'Authentic Indian cuisine with traditional spices and modern presentation techniques.',
                'cuisine': 'Indian',
                'address': '654 Curry Lane, Spice District, City 12349',
                'phone': '+1 (555) 567-8901',
                'email': 'contact@spiceroute.com',
                'image': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
                'rating': Decimal('4.4'),
                'total_reviews': 203,
                'price_range': '$$',
                'opening_time': time(11, 30),
                'closing_time': time(22, 30),
                'is_featured': False,
            },
        ]

        restaurants_created = []
        for restaurant_data in sample_restaurants:
            restaurant = Restaurant.objects.create(**restaurant_data)
            restaurants_created.append(restaurant)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created restaurant: {restaurant.name}'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(restaurants_created)} sample restaurants!'
            )
        )