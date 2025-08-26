from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/restaurants/', include('apps.restaurant.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/favorites/', include('apps.favorites.urls')),
    path('api/offers/', include('apps.offers.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/staff/', include('apps.staff.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)