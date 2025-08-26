// src/components/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ChefHat,
    Clock,
    Star,
    Users,
    MapPin,
    Phone,
    Mail,
    Menu,
    X,
    Calendar,
    Utensils,
    Heart,
    Shield,
    Zap,
    Award,
    BarChart3,
    TrendingUp,
    ShoppingCart,
    DollarSign,
    ChevronRight,
    ArrowRight,
    Sparkles,
    Globe,
    Target,
    Rocket,
} from "lucide-react";

const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const statsRef = useRef(null);
    const navRef = useRef(null);
    const particlesRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Advanced Animation System with anime.js
    useEffect(() => {
        // Load anime.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/animejs/lib/anime.iife.min.js';
        script.async = true;
        script.onload = () => {
            initializeAnimations();
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initializeAnimations = () => {
        if (typeof anime === 'undefined') return;

        // Revolutionary Hero Animation Timeline with Dramatic Effects
        anime.timeline({
            easing: 'easeOutElastic(1, .8)',
            duration: 2000,
        })
        .add({
            targets: '.hero-title',
            translateY: [200, 0],
            opacity: [0, 1],
            scale: [0.3, 1],
            rotate: [15, 0],
            duration: 2500,
            delay: 500,
            elasticity: 600,
        })
        .add({
            targets: '.hero-subtitle',
            translateY: [100, 0],
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 2000,
            delay: 300,
            elasticity: 400,
        }, '-=1800')
        .add({
            targets: '.hero-cta',
            scale: [0, 1],
            opacity: [0, 1],
            rotate: [45, 0],
            duration: 1500,
            delay: anime.stagger(200),
            elasticity: 800,
        }, '-=1200')
        .add({
            targets: '.hero-dashboard',
            translateX: [300, 0],
            opacity: [0, 1],
            scale: [0.5, 1],
            rotate: [20, 0],
            duration: 2000,
            elasticity: 600,
        }, '-=1000');

        // Extreme Floating Particles System
        createFloatingParticles();
        
        // Navigation Animations with Dramatic Effects
        anime({
            targets: '.nav-item',
            translateY: [-100, 0],
            opacity: [0, 1],
            scale: [0, 1],
            rotate: [180, 0],
            duration: 1500,
            delay: anime.stagger(150),
            easing: 'easeOutBounce'
        });

        // Scroll-triggered animations
        setupScrollAnimations();

        // Continuous background animations
        anime({
            targets: '.gradient-orb',
            scale: [1, 1.5, 1],
            rotate: '720deg',
            opacity: [0.3, 0.8, 0.3],
            duration: 8000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine',
            delay: anime.stagger(1000),
        });
    };

    const createFloatingParticles = () => {
        if (typeof anime === 'undefined') return;

        // Extreme floating particles animation with dramatic movements
        anime({
            targets: '.floating-particle',
            translateY: function() {
                return anime.random(-300, 300);
            },
            translateX: function() {
                return anime.random(-300, 300);
            },
            scale: function() {
                return anime.random(0.2, 3);
            },
            opacity: function() {
                return anime.random(0.1, 1);
            },
            rotate: function() {
                return anime.random(-360, 360);
            },
            duration: function() {
                return anime.random(2000, 8000);
            },
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutCubic',
            delay: anime.stagger(300),
        });

        // Dramatic gradient orbs animation
        anime({
            targets: '.gradient-orb',
            scale: [1, 2, 1],
            rotate: '1080deg',
            opacity: [0.2, 1, 0.2],
            duration: 10000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuart',
            delay: anime.stagger(2000),
        });

        // Pulsing effect for particles
        anime({
            targets: '.floating-particle',
            scale: [1, 2, 1],
            opacity: [0.5, 1, 0.5],
            duration: 3000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine',
            delay: anime.stagger(500),
        });
    };

    const setupScrollAnimations = () => {
        if (typeof anime === 'undefined') return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('feature-section')) {
                        animateFeatures();
                    } else if (entry.target.classList.contains('stats-section')) {
                        animateStats();
                    }
                }
            });
        }, { threshold: 0.3 });

        // Observe sections
        document.querySelectorAll('.feature-section, .stats-section').forEach((section) => {
            observer.observe(section);
        });
    };

    const animateFeatures = () => {
        anime({
            targets: '.feature-card',
            translateY: [80, 0],
            opacity: [0, 1],
            scale: [0.8, 1],
            rotateY: [15, 0],
            duration: 1200,
            delay: anime.stagger(150, {start: 300}),
            easing: 'easeOutCubic'
        });

        anime({
            targets: '.feature-icon',
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            duration: 1500,
            delay: anime.stagger(200, {start: 600}),
            easing: 'easeOutElastic(1, .6)'
        });
    };

    const animateStats = () => {
        anime({
            targets: '.stat-number',
            innerHTML: [0, (el) => el.getAttribute('data-value')],
            duration: 2000,
            round: 1,
            easing: 'easeOutExpo',
            delay: anime.stagger(200)
        });

        anime({
            targets: '.stat-card',
            scale: [0.5, 1],
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 1000,
            delay: anime.stagger(100, {start: 200}),
            easing: 'easeOutBack'
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Ultra-Modern Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"></div>
                <div className="gradient-orb absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full filter blur-3xl"></div>
                <div className="gradient-orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full filter blur-3xl"></div>
                <div className="gradient-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-full filter blur-3xl"></div>
                
                {/* Floating Particles */}
                <div className="floating-particle absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full opacity-60"></div>
                <div className="floating-particle absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full opacity-40"></div>
                <div className="floating-particle absolute bottom-32 left-1/3 w-5 h-5 bg-purple-400 rounded-full opacity-50"></div>
                <div className="floating-particle absolute bottom-20 right-20 w-2 h-2 bg-pink-400 rounded-full opacity-70"></div>
                <div className="floating-particle absolute top-1/3 right-1/4 w-4 h-4 bg-green-400 rounded-full opacity-50"></div>
                <div className="floating-particle absolute bottom-1/3 left-1/4 w-3 h-3 bg-yellow-400 rounded-full opacity-60"></div>
            </div>

            {/* Ultra-Modern Navigation */}
            <nav ref={navRef} className="fixed w-full bg-slate-900/40 backdrop-blur-3xl border-b border-white/10 z-50 shadow-2xl shadow-black/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Revolutionary Logo */}
                        <div className="nav-item flex items-center space-x-3 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-pink-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                                <ChefHat className="relative h-12 w-12 text-orange-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="relative">
                                <span className="text-4xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:via-red-300 group-hover:to-pink-300 transition-all duration-500">
                                    AirDine
                                </span>
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-pink-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </div>

                        {/* Enhanced Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-12">
                            <a
                                href="#home"
                                className="nav-item relative text-gray-300 hover:text-orange-400 transition-all duration-300 font-semibold group py-2 px-1"
                            >
                                Home
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </a>
                            <a
                                href="#features"
                                className="nav-item relative text-gray-300 hover:text-orange-400 transition-colors font-medium group"
                            >
                                Features
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </a>
                            <a
                                href="#about"
                                className="nav-item relative text-gray-300 hover:text-orange-400 transition-colors font-medium group"
                            >
                                About
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </a>
                            <a
                                href="#contact"
                                className="nav-item relative text-gray-300 hover:text-orange-400 transition-colors font-medium group"
                            >
                                Contact
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </a>
                            <Link
                                to="/login"
                                className="nav-item group relative px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-xl hover:shadow-orange-500/25 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center">
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="relative p-2 text-gray-300 hover:text-orange-400 transition-colors"
                            >
                                <div className="w-6 h-6 flex flex-col justify-center items-center">
                                    <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                                    <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                    <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="px-4 pt-4 pb-6 space-y-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-b-2xl shadow-2xl shadow-black/20">
                                <a
                                    href="#home"
                                    className="block px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                                >
                                    Home
                                </a>
                                <a
                                    href="#features"
                                    className="block px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                                >
                                    Features
                                </a>
                                <a
                                    href="#about"
                                    className="block px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                                >
                                    About
                                </a>
                                <a
                                    href="#contact"
                                    className="block px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                                >
                                    Contact
                                </a>
                                <Link
                                    to="/login"
                                    className="block mx-2 mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl text-center hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 font-semibold"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section
                id="home"
                className="relative pt-16 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="gradient-orb absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
                    <div className="gradient-orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                    <div className="gradient-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="floating-particle absolute top-20 left-10 w-4 h-4 bg-orange-400 rounded-full opacity-60"></div>
                    <div className="floating-particle absolute top-40 right-20 w-3 h-3 bg-red-400 rounded-full opacity-40"></div>
                    <div className="floating-particle absolute bottom-40 left-20 w-5 h-5 bg-purple-400 rounded-full opacity-50"></div>
                    <div className="floating-particle absolute bottom-20 right-40 w-2 h-2 bg-pink-400 rounded-full opacity-60"></div>
                    <div className="floating-particle absolute top-32 left-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-70"></div>
                    <div className="floating-particle absolute bottom-32 right-1/3 w-4 h-4 bg-green-400 rounded-full opacity-50"></div>
                    <div className="floating-particle absolute top-60 right-10 w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
                    <div className="floating-particle absolute bottom-60 left-40 w-3 h-3 bg-indigo-400 rounded-full opacity-60"></div>
                </div>

                {/* Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="gradient-orb absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
                    <div className="gradient-orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                    <div className="gradient-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full">
                                    <Zap className="h-4 w-4 text-orange-400 mr-2" />
                                    <span className="text-orange-300 text-sm font-medium">Modern Restaurant Management</span>
                                </div>
                                
                                <h1 className="hero-title text-6xl lg:text-7xl xl:text-8xl font-black leading-none">
                                    <span className="block text-white mb-2">Modern</span>
                                    <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">Restaurant</span>
                                    <span className="block text-white">Revolution</span>
                                </h1>
                                
                                <p className="hero-subtitle text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                                    Transform your restaurant with our cutting-edge platform. 
                                    <span className="text-orange-300 font-semibold"> Boost efficiency</span> and 
                                    <span className="text-red-300 font-semibold"> delight customers</span> like never before.
                                </p>
                            </div>

                            <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                <Link
                                    to="/register"
                                    className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative flex items-center justify-center">
                                        <Zap className="h-5 w-5 mr-2" />
                                        Start Free Trial
                                    </span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="group px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-bold rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center">
                                        <Users className="h-5 w-5 mr-2" />
                                        Login
                                    </span>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">500+</div>
                                    <div className="text-gray-400 text-sm">Restaurants</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">50K+</div>
                                    <div className="text-gray-400 text-sm">Orders Daily</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">98%</div>
                                    <div className="text-gray-400 text-sm">Satisfaction</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Enhanced Visual */}
                        <div className="hero-dashboard relative">
                            {/* Main Hero Card */}
                            <div className="relative transform perspective-1000 hover:rotate-y-6 transition-transform duration-700">
                                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                                    
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                                <ChefHat className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">AirDine Dashboard</h3>
                                                <p className="text-gray-300 text-sm">Real-time Analytics</p>
                                            </div>
                                        </div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>

                                    {/* Feature Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="group bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
                                            <Calendar className="h-10 w-10 text-orange-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                                            <h4 className="font-bold text-white mb-2">Smart Booking</h4>
                                            <p className="text-orange-200 text-sm">Quick reservations</p>
                                            <div className="mt-3 flex items-center">
                                                <div className="bg-orange-400 text-orange-900 px-2 py-1 rounded-lg text-xs font-bold">+32%</div>
                                                <span className="text-orange-300 text-xs ml-2">efficiency</span>
                                            </div>
                                        </div>

                                        <div className="group bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm p-6 rounded-2xl border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105">
                                            <Utensils className="h-10 w-10 text-red-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                                            <h4 className="font-bold text-white mb-2">Dynamic Menu</h4>
                                            <p className="text-red-200 text-sm">Real-time updates</p>
                                            <div className="mt-3 flex items-center">
                                                <div className="bg-red-400 text-red-900 px-2 py-1 rounded-lg text-xs font-bold">Live</div>
                                                <span className="text-red-300 text-xs ml-2">sync</span>
                                            </div>
                                        </div>

                                        <div className="group bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                                            <Users className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                                            <h4 className="font-bold text-white mb-2">Team Hub</h4>
                                            <p className="text-purple-200 text-sm">Seamless coordination</p>
                                            <div className="mt-3 flex items-center">
                                                <div className="bg-purple-400 text-purple-900 px-2 py-1 rounded-lg text-xs font-bold">24/7</div>
                                                <span className="text-purple-300 text-xs ml-2">active</span>
                                            </div>
                                        </div>

                                        <div className="group bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                                            <Star className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                                            <h4 className="font-bold text-white mb-2">Analytics</h4>
                                            <p className="text-blue-200 text-sm">Smart insights</p>
                                            <div className="mt-3 flex items-center">
                                                <div className="bg-blue-400 text-blue-900 px-2 py-1 rounded-lg text-xs font-bold">4.9★</div>
                                                <span className="text-blue-300 text-xs ml-2">rating</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Stats */}
                                    <div className="mt-8 pt-6 border-t border-white/20">
                                        <div className="flex justify-between items-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">156</div>
                                                <div className="text-gray-300 text-xs">Orders Today</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">$12.5K</div>
                                                <div className="text-gray-300 text-xs">Revenue</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">89%</div>
                                                <div className="text-gray-300 text-xs">Capacity</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 blur-xl animate-pulse"></div>
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-40 blur-2xl animate-pulse delay-1000"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="feature-section relative py-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce delay-300"></div>
                    <div className="absolute top-40 right-32 w-4 h-4 bg-purple-400 rounded-full opacity-40 animate-bounce delay-700"></div>
                    <div className="absolute bottom-40 left-32 w-2 h-2 bg-orange-400 rounded-full opacity-50 animate-bounce delay-1000"></div>
                    <div className="absolute bottom-20 right-20 w-5 h-5 bg-pink-400 rounded-full opacity-60 animate-bounce delay-500"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full mb-8">
                            <Star className="h-5 w-5 text-blue-400 mr-3" />
                            <span className="text-blue-300 font-semibold">Industry Leading Features</span>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
                            Why Choose 
                            <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                                AirDine?
                            </span>
                        </h2>
                        <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                            Everything you need to run a successful restaurant, powered by 
                            <span className="text-blue-400 font-semibold"> modern design</span>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Feature Card 1 */}
                        <div className="feature-card group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-orange-500/25">
                                        <Zap className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60 blur-sm animate-pulse"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-orange-400 transition-colors duration-300">
                                    Lightning Fast
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                    Process orders and manage tables with incredible
                                    speed and efficiently with quick actions
                                </p>
                                <div className="flex items-center text-orange-400 font-semibold hover:text-orange-300 transition-colors duration-300">
                                    <span>Learn more</span>
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="feature-card group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-green-500/25">
                                        <Shield className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60 blur-sm animate-pulse"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-green-400 transition-colors duration-300">
                                    Secure & Reliable
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                    Enterprise-grade security with 99.9% uptime
                                    guarantee for your business operations
                                </p>
                                <div className="flex items-center text-green-400 font-semibold hover:text-green-300 transition-colors duration-300">
                                    <span>Learn more</span>
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="feature-card group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-blue-500/25">
                                        <Heart className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60 blur-sm animate-pulse"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors duration-300">
                                    Easy to Use
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                    Intuitive interface that your staff will love
                                    and customers will appreciate from day one
                                </p>
                                <div className="flex items-center text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300">
                                    <span>Learn more</span>
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section relative py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '30s'}}></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-3 h-3 bg-orange-400 rounded-full opacity-60 animate-bounce delay-300"></div>
                    <div className="absolute top-40 right-32 w-2 h-2 bg-red-400 rounded-full opacity-40 animate-bounce delay-700"></div>
                    <div className="absolute bottom-40 left-32 w-4 h-4 bg-purple-400 rounded-full opacity-50 animate-bounce delay-1000"></div>
                    <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400 rounded-full opacity-60 animate-bounce delay-500"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full mb-8">
                            <Award className="h-5 w-5 text-orange-400 mr-3" />
                            <span className="text-orange-300 font-semibold">Trusted by Industry Leaders</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            Numbers That
                            <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                                Speak Success
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Stat 1 */}
                        <div className="stat-item group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Utensils className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-5xl lg:text-6xl font-black text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                                    500<span className="text-orange-400">+</span>
                                </div>
                                <div className="text-gray-300 text-lg font-semibold mb-2">Restaurants</div>
                                <div className="text-sm text-gray-400">Actively Using Platform</div>
                                <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="stat-item group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-5xl lg:text-6xl font-black text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                                    50<span className="text-green-400">K+</span>
                                </div>
                                <div className="text-gray-300 text-lg font-semibold mb-2">Orders Daily</div>
                                <div className="text-sm text-gray-400">Processed Successfully</div>
                                <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="stat-item group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Star className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-5xl lg:text-6xl font-black text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                                    98<span className="text-blue-400">%</span>
                                </div>
                                <div className="text-gray-300 text-lg font-semibold mb-2">Satisfaction</div>
                                <div className="text-sm text-gray-400">Customer Rating</div>
                                <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </div>
                        </div>

                        {/* Stat 4 */}
                        <div className="stat-item group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-500 group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-5xl lg:text-6xl font-black text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                                    24<span className="text-purple-400">/7</span>
                                </div>
                                <div className="text-gray-300 text-lg font-semibold mb-2">Support</div>
                                <div className="text-sm text-gray-400">Always Available</div>
                                <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-20">
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Join the revolution and be part of these incredible numbers
                        </p>
                        <Link
                            to="/register"
                            className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative flex items-center">
                                <Zap className="h-5 w-5 mr-3" />
                                Get Started Today
                                <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative py-32 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '35s'}}></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-bounce delay-300"></div>
                    <div className="absolute top-40 left-32 w-3 h-3 bg-pink-400 rounded-full opacity-40 animate-bounce delay-700"></div>
                    <div className="absolute bottom-40 right-32 w-2 h-2 bg-orange-400 rounded-full opacity-50 animate-bounce delay-1000"></div>
                    <div className="absolute bottom-20 left-20 w-5 h-5 bg-red-400 rounded-full opacity-60 animate-bounce delay-500"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full">
                                <Award className="h-5 w-5 text-purple-400 mr-3" />
                                <span className="text-purple-300 font-semibold">Industry Expertise</span>
                            </div>

                            <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                                Built for
                                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                                    Modern
                                </span>
                                Restaurants
                            </h2>

                            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                                AirDine was created by restaurant industry experts who understand 
                                the unique challenges of running a successful food service business. 
                                Our platform combines <span className="text-purple-400 font-semibold">cutting-edge technology</span> with 
                                <span className="text-pink-400 font-semibold"> practical solutions</span>.
                            </p>

                            <div className="space-y-6">
                                <div className="group flex items-start space-x-4 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-green-500/25">
                                        <span className="text-white text-lg font-bold">✓</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">Complete Restaurant Management Suite</h3>
                                        <p className="text-gray-300">Everything from inventory to customer relations in one platform</p>
                                    </div>
                                </div>

                                <div className="group flex items-start space-x-4 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/25">
                                        <span className="text-white text-lg font-bold">✓</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">Real-time Analytics and Reporting</h3>
                                        <p className="text-gray-300">Make data-driven decisions with comprehensive insights</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Enhanced Visual */}
                        <div className="relative">
                            <div className="relative transform perspective-1000 hover:rotate-y-6 transition-transform duration-700">
                                {/* Main Card */}
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-500">
                                    
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <div className="relative inline-block">
                                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-500 shadow-lg shadow-orange-500/25">
                                                <ChefHat className="h-10 w-10 text-white" />
                                            </div>
                                            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/30 to-pink-500/30 rounded-full blur-lg opacity-60"></div>
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-3">
                                            Professional Grade
                                        </h3>
                                        <p className="text-lg text-gray-300">
                                            Designed by professionals, for professionals
                                        </p>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div className="group text-center p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/25">
                                                <Zap className="h-6 w-6 text-white" />
                                            </div>
                                            <h4 className="font-bold text-white text-sm mb-1">Lightning Fast</h4>
                                            <p className="text-xs text-gray-300">Instant responses</p>
                                        </div>

                                        <div className="group text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                                                <Shield className="h-6 w-6 text-white" />
                                            </div>
                                            <h4 className="font-bold text-white text-sm mb-1">Secure</h4>
                                            <p className="text-xs text-gray-300">Bank-level security</p>
                                        </div>

                                        <div className="group text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                            <h4 className="font-bold text-white text-sm mb-1">Collaborative</h4>
                                            <p className="text-xs text-gray-300">Team-focused</p>
                                        </div>

                                        <div className="group text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                                                <Heart className="h-6 w-6 text-white" />
                                            </div>
                                            <h4 className="font-bold text-white text-sm mb-1">User-Friendly</h4>
                                            <p className="text-xs text-gray-300">Intuitive design</p>
                                        </div>
                                    </div>

                                    {/* Bottom Badge */}
                                    <div className="text-center">
                                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full">
                                            <Star className="h-4 w-4 text-orange-400 mr-2" />
                                            <span className="text-sm font-semibold text-gray-200">Rated 4.9/5 by 1000+ restaurants</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-30 blur-2xl animate-pulse"></div>
                                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-25 blur-3xl animate-pulse delay-1000"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '40s'}}></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full opacity-60 animate-bounce delay-300"></div>
                    <div className="absolute top-40 right-32 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-bounce delay-700"></div>
                    <div className="absolute bottom-40 left-32 w-5 h-5 bg-purple-400 rounded-full opacity-50 animate-bounce delay-1000"></div>
                    <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400 rounded-full opacity-60 animate-bounce delay-500"></div>
                </div>

                <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full">
                            <Zap className="h-5 w-5 text-orange-400 mr-3" />
                            <span className="text-orange-300 font-semibold">Ready to Get Started?</span>
                        </div>

                        <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                            Ready to
                            <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                                Transform
                            </span>
                            Your Restaurant?
                        </h2>

                        <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                            Join thousands of successful restaurants using AirDine to 
                            <span className="text-orange-300 font-semibold"> streamline operations</span>, 
                            <span className="text-red-300 font-semibold"> boost revenue</span>, and 
                            <span className="text-pink-300 font-semibold"> delight customers</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link
                                to="/register"
                                className="group relative px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center justify-center">
                                    <Zap className="h-6 w-6 mr-3" />
                                    Start Free Trial
                                    <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="relative bg-slate-900 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid md:grid-cols-4 gap-12">
                        {/* Company Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <ChefHat className="h-12 w-12 text-orange-500 group-hover:rotate-12 transition-transform duration-300" />
                                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <span className="text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                                    AirDine
                                </span>
                            </div>
                            <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                                The complete restaurant management solution for modern food service businesses. 
                                Streamline operations, delight customers, and grow your revenue.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                Quick Links
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#features" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#about" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                                        About
                                    </a>
                                </li>
                                <li>
                                    <Link to="/login" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                                        Get Started
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Contact
                            </h3>
                            <ul className="space-y-4">
                                <li className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-colors duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <span>admin@airdine.com</span>
                                </li>
                                <li className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-colors duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <span>+91 6354932124</span>
                                </li>
                                <li className="group flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-colors duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <span>Gujarat, India</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700/50 mt-16 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-gray-400 text-center md:text-left">
                                © 2025 AirDine. All rights reserved. Built with ❤️ for restaurants worldwide.
                            </p>
                            <div className="flex space-x-6 text-sm text-gray-400">
                                <a href="#" className="hover:text-orange-400 transition-colors duration-300">Privacy Policy</a>
                                <a href="#" className="hover:text-orange-400 transition-colors duration-300">Terms of Service</a>
                                <a href="#" className="hover:text-orange-400 transition-colors duration-300">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;