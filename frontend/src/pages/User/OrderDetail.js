import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await api.orders.getById(id);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelling(true);
            await api.orders.cancelOrder(id);
            alert('Order cancelled successfully');
            await fetchOrder();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                    <Link to="/orders" className="btn-primary">Back to Orders</Link>
                </div>
            </div>
        );
    }

    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block">
                    ← Back to Orders
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                {/* Order Timeline */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
                    <div className="space-y-4">
                        {order.statusHistory?.map((status, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {getStatusIcon(status.status)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 capitalize">
                                        {status.status.replace('_', ' ')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(status.timestamp).toLocaleString('en-IN')}
                                    </p>
                                    {status.note && (
                                        <p className="text-sm text-gray-500 mt-1">{status.note}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Items */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.product?.name || 'Product'}</h3>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">₹{item.price}</p>
                                    <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span>₹{order.deliveryFee?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax</span>
                            <span>₹{order.tax?.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{order.discount?.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Total</span>
                            <span>₹{order.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                        <div className="text-gray-700">
                            <p>{order.deliveryAddress?.street}</p>
                            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                            <p>{order.deliveryAddress?.pincode}</p>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
                        <div className="text-gray-700">
                            <p className="font-semibold capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                            <p className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${order.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {order.paymentStatus?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {canCancel && (
                        <button
                            onClick={cancelOrder}
                            disabled={cancelling}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50"
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/stores')}
                        className="px-6 py-3 border border-gray-300 hover:bg-gray-50 font-semibold rounded-lg"
                    >
                        Order Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
