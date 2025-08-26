from django.core.management.base import BaseCommand
from django.db import transaction
from apps.restaurant.models import Restaurant
from apps.menu.models import MenuCategory, MenuItem
import random

class Command(BaseCommand):
    help = 'Populate menu items for all restaurants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--restaurants',
            type=int,
            default=None,
            help='Number of restaurants to add menus for (default: all existing restaurants)',
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create menu categories
            self.stdout.write('Creating menu categories...')
            categories = self.create_categories()
            
            # Get restaurants
            restaurants = Restaurant.objects.all()
            if options['restaurants']:
                restaurants = restaurants[:options['restaurants']]
            
            if not restaurants.exists():
                self.stdout.write(
                    self.style.ERROR('No restaurants found. Please create restaurants first.')
                )
                return

            self.stdout.write(f'Adding menu items for {restaurants.count()} restaurants...')
            
            for restaurant in restaurants:
                self.create_menu_for_restaurant(restaurant, categories)
                self.stdout.write(f'✓ Created menu for {restaurant.name}')

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created menus for {restaurants.count()} restaurants!'
                )
            )

    def create_categories(self):
        """Create menu categories"""
        categories_data = [
            {'name': 'Appetizers', 'description': 'Start your meal with these delicious appetizers', 'display_order': 1},
            {'name': 'Soups & Salads', 'description': 'Fresh soups and crisp salads', 'display_order': 2},
            {'name': 'Main Course', 'description': 'Our signature main dishes', 'display_order': 3},
            {'name': 'Pizza', 'description': 'Wood-fired pizzas with fresh toppings', 'display_order': 4},
            {'name': 'Pasta', 'description': 'Traditional and modern pasta dishes', 'display_order': 5},
            {'name': 'Desserts', 'description': 'Sweet endings to your perfect meal', 'display_order': 6},
            {'name': 'Beverages', 'description': 'Refreshing drinks and specialty beverages', 'display_order': 7},
        ]

        categories = []
        for cat_data in categories_data:
            category, created = MenuCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories.append(category)
            if created:
                self.stdout.write(f'  ✓ Created category: {category.name}')

        return categories

    def create_menu_for_restaurant(self, restaurant, categories):
        """Create menu items for a specific restaurant"""
        
        # Sample menu items by category
        menu_items = {
            'Appetizers': [
                {'name': 'Bruschetta', 'description': 'Grilled bread with fresh tomatoes, garlic, and basil', 'price': '8.99', 'is_vegetarian': True},
                {'name': 'Calamari Rings', 'description': 'Crispy fried squid rings with marinara sauce', 'price': '12.99'},
                {'name': 'Chicken Wings', 'description': 'Spicy buffalo wings with celery and blue cheese', 'price': '11.99', 'is_spicy': True},
                {'name': 'Mozzarella Sticks', 'description': 'Golden fried mozzarella with marinara dipping sauce', 'price': '9.99', 'is_vegetarian': True},
            ],
            'Soups & Salads': [
                {'name': 'Caesar Salad', 'description': 'Crisp romaine lettuce, parmesan, croutons, caesar dressing', 'price': '10.99', 'is_vegetarian': True},
                {'name': 'Tomato Basil Soup', 'description': 'Creamy tomato soup with fresh basil', 'price': '7.99', 'is_vegetarian': True, 'is_vegan': True},
                {'name': 'Greek Salad', 'description': 'Mixed greens, olives, feta cheese, cucumber, red onion', 'price': '12.99', 'is_vegetarian': True},
                {'name': 'Chicken Noodle Soup', 'description': 'Homemade soup with tender chicken and vegetables', 'price': '8.99'},
            ],
            'Main Course': [
                {'name': 'Grilled Salmon', 'description': 'Fresh Atlantic salmon with lemon herb butter', 'price': '24.99', 'is_gluten_free': True},
                {'name': 'Ribeye Steak', 'description': '12oz premium cut with garlic mashed potatoes', 'price': '32.99', 'is_gluten_free': True},
                {'name': 'Chicken Parmesan', 'description': 'Breaded chicken breast with marinara and mozzarella', 'price': '19.99'},
                {'name': 'Vegetable Stir Fry', 'description': 'Fresh seasonal vegetables in teriyaki sauce', 'price': '16.99', 'is_vegetarian': True, 'is_vegan': True},
            ],
            'Pizza': [
                {'name': 'Margherita Pizza', 'description': 'Fresh mozzarella, tomato sauce, basil leaves', 'price': '16.99', 'is_vegetarian': True},
                {'name': 'Pepperoni Pizza', 'description': 'Classic pepperoni with mozzarella cheese', 'price': '18.99'},
                {'name': 'Meat Lovers Pizza', 'description': 'Pepperoni, sausage, bacon, and ground beef', 'price': '22.99'},
                {'name': 'Veggie Supreme', 'description': 'Bell peppers, mushrooms, onions, olives, tomatoes', 'price': '19.99', 'is_vegetarian': True},
            ],
            'Pasta': [
                {'name': 'Spaghetti Carbonara', 'description': 'Creamy sauce with pancetta, eggs, and parmesan', 'price': '17.99'},
                {'name': 'Fettuccine Alfredo', 'description': 'Rich cream sauce with garlic and parmesan', 'price': '15.99', 'is_vegetarian': True},
                {'name': 'Penne Arrabbiata', 'description': 'Spicy tomato sauce with garlic and red peppers', 'price': '14.99', 'is_vegetarian': True, 'is_spicy': True},
                {'name': 'Lasagna', 'description': 'Layers of pasta, meat sauce, and three cheeses', 'price': '18.99'},
            ],
            'Desserts': [
                {'name': 'Tiramisu', 'description': 'Classic Italian dessert with coffee and mascarpone', 'price': '7.99', 'is_vegetarian': True},
                {'name': 'Chocolate Lava Cake', 'description': 'Warm chocolate cake with molten center', 'price': '8.99', 'is_vegetarian': True},
                {'name': 'New York Cheesecake', 'description': 'Rich and creamy with berry compote', 'price': '6.99', 'is_vegetarian': True},
                {'name': 'Gelato Trio', 'description': 'Three scoops: vanilla, chocolate, and strawberry', 'price': '5.99', 'is_vegetarian': True},
            ],
            'Beverages': [
                {'name': 'Fresh Orange Juice', 'description': 'Freshly squeezed orange juice', 'price': '4.99', 'is_vegetarian': True, 'is_vegan': True},
                {'name': 'Italian Soda', 'description': 'Sparkling water with flavored syrup', 'price': '3.99', 'is_vegetarian': True, 'is_vegan': True},
                {'name': 'Cappuccino', 'description': 'Espresso with steamed milk and foam', 'price': '4.99', 'is_vegetarian': True},
                {'name': 'House Wine', 'description': 'Red or white wine selection', 'price': '7.99', 'is_vegetarian': True, 'is_vegan': True},
            ],
        }

        # Sample images for menu items
        food_images = [
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        ]

        # Create menu items for each category
        for category in categories:
            if category.name in menu_items:
                category_items = menu_items[category.name]
                
                # Add 2-4 items per category for variety
                items_to_add = random.sample(category_items, min(len(category_items), random.randint(2, 4)))
                
                for idx, item_data in enumerate(items_to_add):
                    MenuItem.objects.get_or_create(
                        restaurant=restaurant,
                        name=item_data['name'],
                        defaults={
                            'category': category,
                            'description': item_data['description'],
                            'price': item_data['price'],
                            'image': random.choice(food_images),
                            'is_vegetarian': item_data.get('is_vegetarian', False),
                            'is_vegan': item_data.get('is_vegan', False),
                            'is_gluten_free': item_data.get('is_gluten_free', False),
                            'is_spicy': item_data.get('is_spicy', False),
                            'is_available': True,
                            'is_featured': idx == 0,  # Make first item featured
                            'display_order': idx + 1,
                        }
                    )
