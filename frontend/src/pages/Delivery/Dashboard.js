import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DeliveryDashboard = () => {
    const [stats, setStats] = useState({
        activeDeliveries: 0,
        completedToday: 0,
        totalEarnings: 0
    });
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.orders.getDeliveryOrders();
            const orders = response.data.data || [];

            const active = orders.filter(o => o.status === 'out_for_delivery');
            const today = new Date().toDateString();
            const completedToday = orders.filter(o =>
                o.status === 'delivered' && new Date(o.updatedAt).toDateString() === today
            );

            setStats({
                activeDeliveries: active.length,
                completedToday: completedToday.length,
                totalEarnings: completedToday.reduce((sum, o) => sum + (o.deliveryFee || 0), 0)
            });
            setDeliveries(active);
        } catch (error) {
            console.error('Error fetching data:', error);
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Delivery Dashboard</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Active Deliveries</p>
                        <p className="text-3xl font-bold text-primary-600">{stats.activeDeliveries}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Completed Today</p>
                        <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-2">Today's Earnings</p>
                        <p className="text-3xl font-bold text-blue-600">₹{stats.totalEarnings}</p>
                    </div>
                </div>

                {/* Active Deliveries */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Deliveries</h2>
                    {deliveries.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">No active deliveries</p>
                    ) : (
                        <div className="space-y-4">
                            {deliveries.map(order => (
                                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900">Order #{order.orderNumber}</span>
                                        <span className="text-primary-600 font-bold">₹{order.totalAmount}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
