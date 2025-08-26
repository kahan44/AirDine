// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const currentUser = authService.getCurrentUser();
        const authenticated = authService.isAuthenticated();

        setUser(currentUser);
        setIsAuthenticated(authenticated);
        setLoading(false);
    };

    const login = async (email, password) => {
        setLoading(true);
        let result;
        try {
            result = await authService.login(email, password);
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
            }
        } catch (err) {
            result = { success: false, error: "Login failed" };
        } finally {
            setLoading(false);
        }
        return result;
    };

    const register = async (userData) => {
        setLoading(true);
        const result = await authService.register(userData);

        if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
        }

        setLoading(false);
        return result;
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error in context:", error);
        } finally {
            // Always update state regardless of service response
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        // Also update localStorage to persist changes
        localStorage.setItem("user", JSON.stringify(updatedUserData));
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};