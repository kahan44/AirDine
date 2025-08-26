from django.urls import path
from . import views

app_name = 'menu'

urlpatterns = [
    # Restaurant menu endpoints (public)
    path('restaurant/<uuid:restaurant_id>/', views.RestaurantMenuListView.as_view(), name='restaurant_menu'),
    path('restaurant/<uuid:restaurant_id>/summary/', views.restaurant_menu_summary, name='restaurant_menu_summary'),
    
    # Menu item endpoints (public)
    path('item/<int:pk>/', views.MenuItemDetailView.as_view(), name='menu_item_detail'),
    
    # Category endpoints (public)
    path('categories/', views.MenuCategoriesListView.as_view(), name='menu_categories'),
    
    # Admin menu management endpoints
    path('admin/menu/', views.AdminMenuListView.as_view(), name='admin_menu_list'),
    path('admin/menu/<int:pk>/', views.AdminMenuItemDetailView.as_view(), name='admin_menu_item_detail'),
    path('admin/menu/summary/', views.admin_menu_summary, name='admin_menu_summary'),
]
