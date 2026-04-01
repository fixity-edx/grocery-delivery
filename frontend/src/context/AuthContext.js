import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data.data);
        } catch (error) {
            console.error('Error loading user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, ...userData } = response.data.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(userData);
            return { success: true, data: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const adminLogin = async (credentials) => {
        try {
            const response = await authAPI.adminLogin(credentials);
            const { token, ...userData } = response.data.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(userData);
            return { success: true, data: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Admin login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, ...user } = response.data.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return { success: true, data: user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        adminLogin,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVendor: user?.role === 'vendor',
        isDelivery: user?.role === 'delivery',
        isUser: user?.role === 'user',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
