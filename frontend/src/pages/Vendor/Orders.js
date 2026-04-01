import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        if (selectedStore) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStore]);

    const fetchStores = async () => {
        try {
            const response = await api.stores.getMyStores();
            const storeList = response.data.data || [];
            setStores(storeList);
            if (storeList.length > 0) {
                setSelectedStore(storeList[0]._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!selectedStore) return;
        try {
            setLoading(true);
            const response = await api.orders.getVendorOrders(selectedStore);
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.orders.updateStatus(orderId, { status: newStatus });
            alert('Order status updated');
            await fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['pending', 'confirmed'].includes(order.status);
        if (filter === 'preparing') return order.status === 'preparing';
        if (filter === 'completed') return order.status === 'delivered';
        return true;
    });

    if (loading && !selectedStore) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No stores found</h2>
                    <p className="text-gray-600 mb-8">Create a store first to view orders</p>
                    <a href="/vendor/stores" className="btn-primary">Create Store</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Orders</h1>

                    {/* Store Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Store:</label>
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="input-field py-1 px-3"
                        >
                            {stores.map(store => (
                                <option key={store._id} value={store._id}>{store.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="card mb-6">
                    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                        {[
                            { key: 'all', label: 'All Orders' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'preparing', label: 'Preparing' },
                            { key: 'completed', label: 'Completed' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${filter === tab.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="card text-center py-16">
                        <p className="text-gray-600">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="card">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                                        <p className="text-sm text-gray-600 mt-1">Customer: {order.user?.name} ({order.user?.phone})</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary-600">₹{order.totalAmount}</p>
                                        <p className="text-xs text-gray-500">{order.payment?.method} - {order.payment?.status}</p>
                                    </div>
                                </div>

                                <div className="border-t border-b border-gray-100 py-3 mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>{item.quantity}x {item.product?.name || 'Deleted Product'}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                                        >
                                            Confirm Order
                                        </button>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                                        >
                                            Start Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                                        >
                                            Ready for Delivery
                                        </button>
                                    )}
                                    {order.status === 'out_for_delivery' && (
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrders;
