from django.core.management.base import BaseCommand
from apps.restaurant.models import Restaurant
from apps.bookings.models import TimeSlot


class Command(BaseCommand):
    help = 'Add time slots to all restaurants'

    def handle(self, *args, **options):
        # Get all restaurants
        restaurants = Restaurant.objects.all()
        self.stdout.write(f'Found {restaurants.count()} restaurants')

        # Define time slots
        time_slots = [
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
            '20:00', '20:30', '21:00', '21:30', '22:00'
        ]

        # Add time slots to each restaurant
        for restaurant in restaurants:
            self.stdout.write(f'Adding time slots to: {restaurant.name}')
            
            for time_slot in time_slots:
                # Check if time slot already exists
                if not TimeSlot.objects.filter(restaurant=restaurant, time=time_slot).exists():
                    TimeSlot.objects.create(
                        restaurant=restaurant,
                        time=time_slot,
                        max_capacity=50,  # Default capacity
                        is_active=True
                    )
                    self.stdout.write(f'  - Added {time_slot}')
                else:
                    self.stdout.write(f'  - {time_slot} already exists')

        self.stdout.write(
            self.style.SUCCESS('Time slots setup complete!')
        )
