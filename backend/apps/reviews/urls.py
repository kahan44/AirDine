from django.urls import path
from . import views

app_name = 'reviews'

urlpatterns = [
    # Restaurant reviews endpoints
    path('restaurant/<uuid:restaurant_id>/', views.RestaurantReviewsListView.as_view(), name='restaurant_reviews'),
    path('restaurant/<uuid:restaurant_id>/create/', views.ReviewCreateView.as_view(), name='create_review'),
    
    # Individual review endpoints
    path('<int:pk>/', views.ReviewDetailView.as_view(), name='review_detail'),
    
    # User reviews
    path('user/my-reviews/', views.user_reviews, name='user_reviews'),
]
