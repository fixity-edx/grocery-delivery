import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStores: 0,
        totalProducts: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch stores first
            const storesRes = await api.stores.getMyStores();
            const stores = storesRes.data.data || [];

            if (stores.length === 0) {
                setStats({
                    totalStores: 0,
                    totalProducts: 0,
                    pendingOrders: 0,
                    totalRevenue: 0
                });
                setRecentOrders([]);
                setLowStockProducts([]);
                setLoading(false);
                return;
            }

            // 2. Fetch orders and products for each store
            const dataPromises = stores.map(store =>
                Promise.all([
                    api.orders.getVendorOrders(store._id),
                    api.products.getByStore(store._id)
                ])
            );

            const results = await Promise.all(dataPromises);

            // 3. Aggregate data
            let allOrders = [];
            let allProducts = [];

            results.forEach(([ordersRes, productsRes]) => {
                const storeOrders = ordersRes.data.data || [];
                const storeProducts = productsRes.data.data || [];

                allOrders = [...allOrders, ...storeOrders];
                allProducts = [...allProducts, ...storeProducts];
            });

            // 4. Calculate stats
            setStats({
                totalStores: stores.length,
                totalProducts: allProducts.length,
                pendingOrders: allOrders.filter(o => ['pending', 'confirmed'].includes(o.status)).length,
                totalRevenue: allOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.pricing.total, 0)
            });

            // Sort by date descending
            allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setRecentOrders(allOrders.slice(0, 5));
            setLowStockProducts(allProducts.filter(p => p.stock < 10 && p.stock > 0).slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Stores</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStores}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏪</span>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Orders</p>
                                <p className="text-3xl font-bold text-primary-600 mt-1">{stats.pendingOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-between">
                                <span className="text-2xl">📋</span>
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">₹{stats.totalRevenue.toFixed(0)}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/vendor/stores" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">🏪</div>
                            <h3 className="text-lg font-semibold text-gray-900">Manage Stores</h3>
                            <p className="text-sm text-gray-600 mt-1">Add or edit your stores</p>
                        </div>
                    </Link>

                    <Link to="/vendor/products" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">📦</div>
                            <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
                            <p className="text-sm text-gray-600 mt-1">Update your inventory</p>
                        </div>
                    </Link>

                    <Link to="/vendor/ai-tools" className="card hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="text-center py-6">
                            <div className="text-4xl mb-3">🤖</div>
                            <h3 className="text-lg font-semibold text-gray-900">AI Tools</h3>
                            <p className="text-sm text-gray-600 mt-1">Get AI-powered insights</p>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                            <Link to="/vendor/orders" className="text-primary-600 hover:text-primary-700 font-semibold">
                                View All →
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map(order => (
                                    <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-gray-900">Order #{order.orderNumber}</span>
                                            <span className="text-primary-600 font-bold">₹{order.totalAmount}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
                            <Link to="/vendor/products" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Manage →
                            </Link>
                        </div>

                        {lowStockProducts.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">All products well stocked!</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockProducts.map(product => (
                                    <div key={product._id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{product.name}</p>
                                                <p className="text-sm text-orange-600">Only {product.stock} left</p>
                                            </div>
                                            <span className="text-2xl">⚠️</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
