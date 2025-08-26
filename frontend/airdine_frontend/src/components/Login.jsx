// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
    ChefHat,
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    Loader,
    Info,
    User,
    Shield,
    X,
} from "lucide-react";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showQuickLogin, setShowQuickLogin] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    // Quick login credentials
    const quickLoginCredentials = [
        {
            id: 1,
            label: "Customer 1",
            email: "user@gmail.com",
            password: "kahan1234",
            type: "customer",
            icon: User,
            description: "Test Customer Account"
        },
        {
            id: 2,
            label: "Customer 2", 
            email: "user2@test.com",
            password: "user2@123",
            type: "customer",
            icon: User,
            description: "Alternative Customer Account"
        },
        {
            id: 3,
            label: "Admin 1 (Ocean Breeze)",
            email: "admin@test.com", 
            password: "admin@123",
            type: "admin",
            icon: Shield,
            description: "Ocean Breeze Restaurant Admin"
        },
        {
            id: 4,
            label: "Admin 2 (Spice Route)",
            email: "admin@spice.com",
            password: "admin@123", 
            type: "admin",
            icon: Shield,
            description: "Spice Route Restaurant Admin"
        }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleQuickLogin = (credentials) => {
        setFormData({
            email: credentials.email,
            password: credentials.password
        });
        setShowQuickLogin(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(formData.email, formData.password);

        if (result.success) {
            const role = result.user.role;
            switch (role) {
                case "admin":
                    navigate("/admin/dashboard");
                    break;
				case "customer":
					navigate("/user/dashboard");
            }
        } else {
            setError(
                result.error.detail || "Invalid credentials. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Quick Login Info Button */}
            <button
                onClick={() => setShowQuickLogin(!showQuickLogin)}
                className="fixed top-6 right-6 z-50 bg-white/90 hover:bg-white backdrop-blur-sm border border-orange-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                title="Quick Login Info"
            >
                <Info className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Quick Login Sidebar */}
            {showQuickLogin && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setShowQuickLogin(false)}
                    ></div>
                    
                    {/* Sidebar */}
                    <div className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Login</h3>
                                    <p className="text-sm text-gray-600 mt-1">Click to auto-fill credentials</p>
                                </div>
                                <button
                                    onClick={() => setShowQuickLogin(false)}
                                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Credentials List */}
                        <div className="p-6 space-y-4 overflow-y-auto h-full pb-20">
                            {quickLoginCredentials.map((credential) => {
                                const IconComponent = credential.icon;
                                return (
                                    <div
                                        key={credential.id}
                                        onClick={() => handleQuickLogin(credential)}
                                        className="group cursor-pointer bg-white/60 hover:bg-white/80 border border-gray-200 hover:border-orange-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-lg ${
                                                credential.type === 'admin' 
                                                    ? 'bg-orange-100 text-orange-600' 
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                                        {credential.label}
                                                    </h4>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        credential.type === 'admin'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {credential.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{credential.description}</p>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-600 font-mono">{credential.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Lock className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-600 font-mono">
                                                            {'•'.repeat(credential.password.length)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                Click to auto-fill form →
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Info Note */}
                            <div className="mt-6 p-4 bg-orange-50/50 border border-orange-200 rounded-xl">
                                <div className="flex items-start space-x-2">
                                    <Info className="w-4 h-4 text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-medium text-orange-800">Demo Accounts</p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            These are test accounts for demonstration purposes. 
                                            Click any credential to auto-fill the login form.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-2 mb-6">
                        <ChefHat className="h-12 w-12 text-orange-500" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            AirDine
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="h-5 w-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                New to AirDine?
                            </span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/register"
                            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                        >
                            Create your account
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
