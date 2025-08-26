from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Review

User = get_user_model()

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for displaying reviews"""
    user_name = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'restaurant',
            'user_id',
            'user_name',
            'rating',
            'title',
            'comment',
            'created_at',
            'updated_at',
            'is_owner'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id', 'user_name']
    
    def get_user_name(self, obj):
        """Get user's display name"""
        return obj.user_name
    
    def get_is_owner(self, obj):
        """Check if the current user is the owner of this review"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = [
            'rating',
            'title',
            'comment'
        ]
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating reviews"""
    
    class Meta:
        model = Review
        fields = [
            'rating',
            'title', 
            'comment'
        ]
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
