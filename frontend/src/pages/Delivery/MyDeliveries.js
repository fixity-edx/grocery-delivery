import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MyDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const response = await api.orders.getDeliveryOrders();
            setDeliveries(response.data.data || []);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.orders.updateStatus(orderId, { status: newStatus });
            alert('Status updated');
            await fetchDeliveries();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredDeliveries = deliveries.filter(d => {
        if (filter === 'active') return d.status === 'out_for_delivery';
        if (filter === 'completed') return d.status === 'delivered';
        return true;
    });

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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Deliveries</h1>

                {/* Filter */}
                <div className="card mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg font-semibold ${filter === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-semibold ${filter === 'completed' ? 'bg-primary-600 text-white' : 'bg-gray-100'
                                }`}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {/* Deliveries List */}
                {filteredDeliveries.length === 0 ? (
                    <div className="card text-center py-16">
                        <p className="text-gray-600">No deliveries found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredDeliveries.map(order => (
                            <div key={order._id} className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h3>
                                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary-600">₹{order.totalAmount}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Delivery Address:</p>
                                    <p className="text-sm text-gray-600">
                                        {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                                    </p>
                                </div>

                                {order.status === 'out_for_delivery' && (
                                    <button
                                        onClick={() => updateStatus(order._id, 'delivered')}
                                        className="btn-primary"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeliveries;
