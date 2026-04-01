import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.orders.getMyOrders();
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            preparing: 'bg-purple-100 text-purple-800 border-purple-200',
            out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            preparing: '👨‍🍳',
            out_for_delivery: '🚚',
            delivered: '📦',
            cancelled: '❌'
        };
        return icons[status] || '📋';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status);
        if (filter === 'completed') return order.status === 'delivered';
        if (filter === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Filter Tabs */}
                <div className="card mb-6">
                    <div className="flex gap-4 overflow-x-auto">
                        {[
                            { key: 'all', label: 'All Orders', count: orders.length },
                            { key: 'active', label: 'Active', count: orders.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length },
                            { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length },
                            { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${filter === tab.key
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-8xl mb-6">📦</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
                        <p className="text-gray-600 mb-8">
                            {filter === 'all' ? 'You haven\'t placed any orders yet' : `No ${filter} orders`}
                        </p>
                        <Link to="/stores" className="btn-primary inline-block">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <Link
                                key={order._id}
                                to={`/orders/${order._id}`}
                                className="card hover:shadow-lg transition-all block"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Order #{order.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary-600">₹{order.totalAmount}</p>
                                        <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-semibold text-gray-700">Items:</span>
                                        <div className="flex-1 flex flex-wrap gap-2">
                                            {order.items?.slice(0, 3).map((item, index) => (
                                                <span key={index} className="text-sm text-gray-600">
                                                    {item.product?.name || 'Product'} (x{item.quantity})
                                                    {index < Math.min(2, order.items.length - 1) && ','}
                                                </span>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <span>📍</span>
                                        <span>
                                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                                        </span>
                                    </div>

                                    {/* Estimated Delivery */}
                                    {order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                        <div className="mt-3 flex items-center gap-2 text-sm">
                                            <span>🕐</span>
                                            <span className="text-gray-700">
                                                Estimated delivery: {new Date(order.estimatedDeliveryTime).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <span className="text-primary-600 font-semibold">
                                        View Details →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
