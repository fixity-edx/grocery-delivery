import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        wishlistItems: 0,
        walletBalance: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [ordersRes, profileRes] = await Promise.all([
                api.orders.getMyOrders(),
                api.users.getProfile()
            ]);

            const orders = ordersRes.data.data || [];
            const profile = profileRes.data.data || {};

            setStats({
                totalOrders: orders.length,
                activeOrders: orders.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length,
                wishlistItems: profile.wishlist?.length || 0,
                walletBalance: profile.wallet?.balance || 0
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            out_for_delivery: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
                    <p className="text-gray-600 mt-2">Here's what's happening with your orders today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Orders</p>
                                <p className="text-3xl font-bold text-primary-600 mt-1">{stats.activeOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚚</span>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Wishlist Items</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.wishlistItems}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">❤️</span>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">₹{stats.walletBalance}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/stores" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">🏪</div>
                            <h3 className="text-lg font-semibold text-gray-900">Browse Stores</h3>
                            <p className="text-sm text-gray-600 mt-1">Find nearby grocery stores</p>
                        </div>
                    </Link>

                    <Link to="/cart" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">🛒</div>
                            <h3 className="text-lg font-semibold text-gray-900">My Cart</h3>
                            <p className="text-sm text-gray-600 mt-1">Review your shopping cart</p>
                        </div>
                    </Link>

                    <Link to="/ai-assistant" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">🤖</div>
                            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                            <p className="text-sm text-gray-600 mt-1">Get smart recommendations</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                        <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-semibold">
                            View All →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-600 mb-4">No orders yet</p>
                            <Link to="/stores" className="btn-primary inline-block">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    to={`/orders/${order._id}`}
                                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-gray-900">Order #{order.orderNumber}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {order.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {order.items?.length || 0} items • ₹{order.totalAmount}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-primary-600">→</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
