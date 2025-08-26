# Generated migration for offers app

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('restaurant', '0001_initial'),
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Offer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('offer_type', models.CharField(choices=[('percentage', 'Percentage Off'), ('fixed', 'Fixed Amount Off'), ('bogo', 'Buy One Get One'), ('combo', 'Combo Deal')], max_length=20)),
                ('discount_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('discount_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('minimum_order_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('maximum_discount_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('usage_limit_per_user', models.PositiveIntegerField(blank=True, null=True)),
                ('total_usage_limit', models.PositiveIntegerField(blank=True, null=True)),
                ('valid_from', models.DateTimeField()),
                ('valid_until', models.DateTimeField()),
                ('valid_days', models.CharField(blank=True, help_text='Comma-separated days (0=Monday, 6=Sunday)', max_length=20)),
                ('valid_time_start', models.TimeField(blank=True, null=True)),
                ('valid_time_end', models.TimeField(blank=True, null=True)),
                ('terms_and_conditions', models.TextField(blank=True)),
                ('promo_code', models.CharField(blank=True, max_length=50, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('image', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='offers', to='restaurant.restaurant')),
            ],
            options={
                'ordering': ['-is_featured', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='OfferUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('used_at', models.DateTimeField(auto_now_add=True)),
                ('offer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usages', to='offers.offer')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='authentication.customuser')),
            ],
            options={
                'unique_together': {('offer', 'user')},
            },
        ),
    ]
