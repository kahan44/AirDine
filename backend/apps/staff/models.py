from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from apps.restaurant.models import Restaurant


class RestaurantAdmin(models.Model):
	"""Links an admin user to exactly one restaurant."""
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="restaurant_admin_profile",
	)
	# One admin per restaurant (and one restaurant per admin)
	restaurant = models.OneToOneField(
		Restaurant,
		on_delete=models.CASCADE,
		related_name="admin_profile",
	)
	assigned_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = "Restaurant Admin"
		verbose_name_plural = "Restaurant Admins"

	def clean(self):
		# Ensure the linked user has the admin role
		if getattr(self.user, "role", None) != "admin":
			raise ValidationError("Linked user must have role 'admin'.")

	def save(self, *args, **kwargs):
		self.full_clean()
		return super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.user.email} -> {self.restaurant.name}"
