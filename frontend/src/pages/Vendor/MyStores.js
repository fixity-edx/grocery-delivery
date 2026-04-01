import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Grocery',
        address: { street: '', city: '', state: '', pincode: '', coordinates: [0, 0] },
        contactNumber: '',
        logo: '',
        timings: {
            open: '09:00',
            close: '21:00',
            daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
    });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await api.stores.getMyStores();
            setStores(response.data.data || []);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                contact: {
                    phone: formData.contactNumber
                }
            };
            delete payload.contactNumber; // Remove the frontend-only field

            if (editingStore) {
                await api.stores.update(editingStore._id, payload);
                alert('Store updated successfully');
            } else {
                await api.stores.create(payload);
                alert('Store created successfully! Pending admin approval.');
            }
            setShowForm(false);
            setEditingStore(null);
            resetForm();
            await fetchStores();
        } catch (error) {
            console.error('Error saving store:', error);
            alert(error.response?.data?.message || 'Failed to save store');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'Grocery',
            address: { street: '', city: '', state: '', pincode: '', coordinates: [0, 0] },
            contactNumber: '',
            logo: '',
            timings: {
                open: '09:00',
                close: '21:00',
                daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
        });
    };

    const editStore = (store) => {
        setEditingStore(store);
        setFormData({
            name: store.name,
            description: store.description || '',
            category: store.category || 'Grocery',
            address: store.address || { street: '', city: '', state: '', pincode: '', coordinates: [0, 0] },
            contactNumber: store.contact?.phone || '',
            logo: store.logo || '',
            timings: {
                open: store.timings?.open || '09:00',
                close: store.timings?.close || '21:00',
                daysOpen: store.timings?.daysOpen || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
        });
        setShowForm(true);
    };

    const toggleStoreStatus = async (storeId, currentStatus) => {
        try {
            await api.stores.update(storeId, { isActive: !currentStatus });
            await fetchStores();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update store status');
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">My Stores</h1>
                        <p className="text-gray-600 mt-2">{stores.length} store(s)</p>
                    </div>
                    {!showForm && (
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            + Add New Store
                        </button>
                    )}
                </div>

                {/* Store Form */}
                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingStore ? 'Edit Store' : 'Add New Store'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="Grocery">Grocery</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Meat">Meat</option>
                                        <option value="Organic">Organic</option>
                                        <option value="Supermarket">Supermarket</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo Emoji</label>
                                    <input
                                        type="text"
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        className="input-field"
                                        placeholder="🏪"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                                <input
                                    type="text"
                                    value={formData.address.street}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                                    <input
                                        type="text"
                                        value={formData.address.pincode}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="card bg-gray-50 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3">Operating Hours</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Opens At</label>
                                        <input
                                            type="time"
                                            value={formData.timings.open}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                timings: { ...formData.timings, open: e.target.value }
                                            })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Closes At</label>
                                        <input
                                            type="time"
                                            value={formData.timings.close}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                timings: { ...formData.timings, close: e.target.value }
                                            })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Days Open</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <label key={day} className="inline-flex items-center bg-white px-3 py-1 rounded-full border cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.timings.daysOpen.includes(day)}
                                                    onChange={(e) => {
                                                        const days = e.target.checked
                                                            ? [...formData.timings.daysOpen, day]
                                                            : formData.timings.daysOpen.filter(d => d !== day);
                                                        setFormData({
                                                            ...formData,
                                                            timings: { ...formData.timings, daysOpen: days }
                                                        });
                                                    }}
                                                    className="form-checkbox h-4 w-4 text-primary-600 rounded mr-2"
                                                />
                                                <span className="text-sm text-gray-700">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary">
                                    {editingStore ? 'Update Store' : 'Create Store'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingStore(null);
                                        resetForm();
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Stores List */}
                {stores.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-8xl mb-6">🏪</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No stores yet</h2>
                        <p className="text-gray-600 mb-8">Create your first store to start selling</p>
                        {!showForm && (
                            <button onClick={() => setShowForm(true)} className="btn-primary">
                                Create Store
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map(store => (
                            <div key={store._id} className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                                        <span className="text-3xl">{store.logo || '🏪'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStoreStatus(store._id, store.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${store.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {store.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{store.description}</p>

                                <div className="text-sm text-gray-600 mb-3">
                                    <p>📍 {store.address?.city}, {store.address?.state}</p>
                                    <p>📞 {store.contact?.phone || 'N/A'}</p>
                                </div>

                                <div className="mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${store.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {store.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editStore(store)}
                                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <Link
                                        to={`/vendor/products?store=${store._id}`}
                                        className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-semibold text-center"
                                    >
                                        Products
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyStores;
