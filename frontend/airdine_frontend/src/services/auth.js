// src/services/auth.js
import api from "./api";

class AuthService {
    // Login user
    async login(email, password) {
        try {
            const response = await api.post("/auth/login/", {
                email,
                password,
            });

            const { access, refresh } = response.data;

            // Store tokens
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            // Get user profile
            const userResponse = await api.get("/auth/profile/");
            localStorage.setItem("user", JSON.stringify(userResponse.data));

            return {
                success: true,
                user: userResponse.data,
                tokens: { access, refresh },
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || "Login failed",
            };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await api.post("/auth/register/", userData);

            const { tokens, user } = response.data;

            // Store tokens
            localStorage.setItem("access_token", tokens.access);
            localStorage.setItem("refresh_token", tokens.refresh);
            localStorage.setItem("user", JSON.stringify(user));

            return {
                success: true,
                user,
                tokens,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || "Registration failed",
            };
        }
    }

    // Logout user
    async logout() {
        // Get refresh token before clearing storage
        const refreshToken = localStorage.getItem("refresh_token");
        
        // Clear local storage immediately (most important)
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        
        // Try to notify server for cleanup, but don't fail if it doesn't work
        try {
            if (refreshToken) {
                await api.post("/auth/logout/", {
                    refresh: refreshToken,
                });
                console.log("Server logout successful");
            }
        } catch (error) {
            // Ignore server errors - user is already logged out locally
            console.log("Server logout failed, but local logout successful:", error);
        }
        
        console.log("Client logout completed successfully");
    }

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem("access_token");
    }

    // Get user role
    getUserRole() {
        const user = this.getCurrentUser();
        return user?.role || null;
    }
}

export default new AuthService();
