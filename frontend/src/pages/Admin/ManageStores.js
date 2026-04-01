import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await api.admin.getAllStores();
            setStores(response.data.data || []);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveStore = async (storeId) => {
        try {
            await api.admin.approveStore(storeId, { approved: true });
            alert('Store approved');
            await fetchStores();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve store');
        }
    };

    const rejectStore = async (storeId) => {
        if (!window.confirm('Reject this store?')) return;
        try {
            await api.admin.approveStore(storeId, { approved: false });
            alert('Store rejected');
            await fetchStores();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject store');
        }
    };

    const filteredStores = stores.filter(s => {
        if (filter === 'pending') return !s.isApproved;
        if (filter === 'approved') return s.isApproved;
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Stores</h1>

                {/* Filter */}
                <div className="card mb-6">
                    <div className="flex gap-4">
                        {['pending', 'approved', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-semibold capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stores Grid */}
                {filteredStores.length === 0 ? (
                    <div className="card text-center py-16">
                        <p className="text-gray-600">No stores found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStores.map(store => (
                            <div key={store._id} className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                                        <span className="text-3xl">{store.logo || '🏪'}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${store.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {store.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{store.description}</p>
                                <p className="text-sm text-gray-600 mb-3">
                                    📍 {store.address?.city}, {store.address?.state}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    👤 Owner: {store.owner?.name}
                                </p>

                                {!store.isApproved && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => approveStore(store._id)}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectStore(store._id)}
                                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageStores;
