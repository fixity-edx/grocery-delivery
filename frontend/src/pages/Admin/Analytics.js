import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalStores: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [usersRes, storesRes, ordersRes] = await Promise.all([
                api.admin.getAllUsers(),
                api.admin.getAllStores(),
                api.admin.getAllOrders()
            ]);

            const orders = ordersRes.data.data || [];
            const revenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

            setAnalytics({
                totalRevenue: revenue,
                totalOrders: orders.length,
                totalUsers: usersRes.data.data?.length || 0,
                totalStores: storesRes.data.data?.length || 0
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Platform Analytics</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600">₹{analytics.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                        <p className="text-3xl font-bold text-primary-600">{analytics.totalOrders}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Total Users</p>
                        <p className="text-3xl font-bold text-blue-600">{analytics.totalUsers}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Total Stores</p>
                        <p className="text-3xl font-bold text-purple-600">{analytics.totalStores}</p>
                    </div>
                </div>

                {/* Charts Placeholder */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600">Chart visualization coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
