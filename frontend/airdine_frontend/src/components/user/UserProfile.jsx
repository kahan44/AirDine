// src/components/user/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import PageHeader from "../common/PageHeader";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Edit3,
    Save,
    X,
    Loader,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
} from "lucide-react";

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
    });

    // Load user profile on component mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const profileData = await authAPI.getProfile();
            setProfile(profileData);
            setFormData({
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                phone: profileData.phone || '',
            });
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const updatedProfile = await authAPI.updateProfile(formData);
            
            // Update local profile state
            setProfile(updatedProfile.user);
            
            // Update the auth context with new user data (this now also updates localStorage)
            if (updateUser) {
                updateUser(updatedProfile.user);
            }

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            phone: profile?.phone || '',
        });
        setIsEditing(false);
        setError(null);
        setSuccess(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Profile Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Unable to load your profile information.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={loadProfile}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="mb-6">
                    <PageHeader
                        title="My Profile"
                        subtitle="Manage your account information"
                        icon={User}
                        actions={
                            <Link
                                to="/user/dashboard"
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Dashboard
                            </Link>
                        }
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-700">{success}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Picture & Basic Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <div className="text-center">
                                {/* Profile Avatar */}
                                <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                    {profile.first_name?.[0]?.toUpperCase()}
                                    {profile.last_name?.[0]?.toUpperCase()}
                                </div>
                                
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {profile.first_name} {profile.last_name}
                                </h1>
                                
                                <p className="text-gray-600 mb-1">{profile.email}</p>
                                
                                <div className="flex items-center justify-center space-x-2 mb-4">
                                    <Shield className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500 capitalize">
                                        {profile.role}
                                    </span>
                                    {profile.is_verified && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-green-600">Verified</span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Member since {formatDate(profile.date_joined)}
                                </div>

                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 disabled:bg-green-300"
                                        >
                                            {saving ? (
                                                <Loader className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="w-full bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Profile Information
                            </h2>

                            <div className="space-y-6">
                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter your first name"
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-900">{profile.first_name || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter your last name"
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-900">{profile.last_name || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-xl">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600">{profile.email}</span>
                                        <span className="text-xs text-gray-400 ml-auto">Cannot be changed</span>
                                    </div>
                                </div>

                                {/* Phone (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-900">{profile.phone || 'Not provided'}</span>
                                        <span className="text-xs text-gray-400 ml-auto">Cannot be changed</span>
                                    </div>
                                </div>

                                {/* Username (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-xl">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600">{profile.username}</span>
                                        <span className="text-xs text-gray-400 ml-auto">Cannot be changed</span>
                                    </div>
                                </div>

                                {/* Role (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Type
                                    </label>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-xl">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600 capitalize">{profile.role}</span>
                                        {profile.is_verified && (
                                            <div className="flex items-center space-x-1 ml-auto">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-xs text-green-600">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
