from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import time
from apps.restaurant.models import Restaurant
from apps.bookings.models import TimeSlot


class Command(BaseCommand):
    help = 'Create default time slots for all restaurants'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--capacity',
            type=int,
            default=10,
            help='Default capacity for each time slot'
        )
    
    def handle(self, *args, **options):
        capacity = options['capacity']
        
        # Default time slots (every 30 minutes from 11:00 to 22:00)
        default_times = [
            time(11, 0),   # 11:00 AM
            time(11, 30),  # 11:30 AM
            time(12, 0),   # 12:00 PM
            time(12, 30),  # 12:30 PM
            time(13, 0),   # 1:00 PM
            time(13, 30),  # 1:30 PM
            time(14, 0),   # 2:00 PM
            time(14, 30),  # 2:30 PM
            time(15, 0),   # 3:00 PM
            time(15, 30),  # 3:30 PM
            time(16, 0),   # 4:00 PM
            time(16, 30),  # 4:30 PM
            time(17, 0),   # 5:00 PM
            time(17, 30),  # 5:30 PM
            time(18, 0),   # 6:00 PM
            time(18, 30),  # 6:30 PM
            time(19, 0),   # 7:00 PM
            time(19, 30),  # 7:30 PM
            time(20, 0),   # 8:00 PM
            time(20, 30),  # 8:30 PM
            time(21, 0),   # 9:00 PM
            time(21, 30),  # 9:30 PM
            time(22, 0),   # 10:00 PM
        ]
        
        restaurants = Restaurant.objects.filter(is_active=True)
        created_count = 0
        
        for restaurant in restaurants:
            self.stdout.write(f"Creating time slots for {restaurant.name}...")
            
            for slot_time in default_times:
                time_slot, created = TimeSlot.objects.get_or_create(
                    restaurant=restaurant,
                    time=slot_time,
                    defaults={
                        'max_capacity': capacity,
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f"  Created slot: {slot_time.strftime('%H:%M')}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} time slots for {restaurants.count()} restaurants'
            )
        )
