import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingStores: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [usersRes, storesRes, ordersRes] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getAllStores(),
                adminAPI.getAllOrders()
            ]);

            const users = usersRes.data.data || [];
            const stores = storesRes.data.data || [];
            const orders = ordersRes.data.data || [];

            setStats({
                totalUsers: users.length,
                totalStores: stores.length,
                totalOrders: orders.length,
                totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0),
                pendingStores: stores.filter(s => !s.isApproved).length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="card hover:shadow-lg transition-shadow">
                        <p className="text-sm text-gray-600 mb-2">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="card hover:shadow-lg transition-shadow">
                        <p className="text-sm text-gray-600 mb-2">Total Stores</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalStores}</p>
                    </div>
                    <div className="card hover:shadow-lg transition-shadow">
                        <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                        <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
                    </div>
                    <div className="card hover:shadow-lg transition-shadow">
                        <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(0)}</p>
                    </div>
                    <div className="card hover:shadow-lg transition-shadow">
                        <p className="text-sm text-gray-600 mb-2">Pending Stores</p>
                        <p className="text-3xl font-bold text-orange-600">{stats.pendingStores}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <a href="/admin/users" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">👥</div>
                            <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                        </div>
                    </a>
                    <a href="/admin/stores" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">🏪</div>
                            <h3 className="text-lg font-semibold text-gray-900">Manage Stores</h3>
                        </div>
                    </a>
                    <a href="/admin/orders" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">📦</div>
                            <h3 className="text-lg font-semibold text-gray-900">View Orders</h3>
                        </div>
                    </a>
                    <a href="/admin/analytics" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
