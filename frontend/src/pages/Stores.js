import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        filterStores();
    }, [searchTerm, selectedCategory, stores]);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await api.stores.getAll();
            const storesData = response.data.data || [];
            // Only show approved stores
            const approvedStores = storesData.filter(store => store.isApproved);
            setStores(approvedStores);
            setFilteredStores(approvedStores);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterStores = () => {
        let filtered = [...stores];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(store =>
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(store =>
                store.category === selectedCategory
            );
        }

        setFilteredStores(filtered);
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400">⯨</span>);
        }
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
        }
        return stars;
    };

    const getStoreStatus = (store) => {
        if (!store.isActive) return { text: 'Closed', color: 'text-red-600' };

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Check if open today
        if (store.timings?.daysOpen && !store.timings.daysOpen.includes(currentDay)) {
            return { text: 'Closed Today', color: 'text-red-600' };
        }

        if (!store.timings?.open || !store.timings?.close) {
            // Fallback if no timings set
            return { text: 'Open', color: 'text-green-600' };
        }

        const [openHour, openMin] = store.timings.open.split(':').map(Number);
        const [closeHour, closeMin] = store.timings.close.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;

        if (currentTime >= openTime && currentTime <= closeTime) {
            return { text: 'Open Now', color: 'text-green-600' };
        }
        return { text: 'Closed', color: 'text-red-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading stores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Stores</h1>
                    <p className="text-gray-600">Discover local grocery stores near you</p>
                </div>

                {/* Search and Filters */}
                <div className="card mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Stores
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Categories</option>
                                <option value="Grocery">Grocery</option>
                                <option value="Supermarket">Supermarket</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Bakery">Bakery</option>
                                <option value="Meat">Meat & Seafood</option>
                                <option value="Organic">Organic</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredStores.length} of {stores.length} stores
                        </p>
                        {(searchTerm || selectedCategory !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Stores Grid */}
                {filteredStores.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                            }}
                            className="btn-primary"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStores.map((store) => {
                            const status = getStoreStatus(store);
                            return (
                                <Link
                                    key={store._id}
                                    to={`/stores/${store._id}`}
                                    className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Store Image */}
                                    <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg flex items-center justify-center mb-4">
                                        <span className="text-6xl">{store.logo || '🏪'}</span>
                                    </div>

                                    {/* Store Info */}
                                    <div className="px-6 pb-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                                            <span className={`text-sm font-semibold ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {store.description || 'Fresh groceries and daily essentials'}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex">
                                                {getRatingStars(store.rating?.average || 0)}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {store.rating?.average?.toFixed(1) || '0.0'} ({store.rating?.count || 0})
                                            </span>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                                            <span>📍</span>
                                            <span className="line-clamp-2">
                                                {store.address?.street}, {store.address?.city}
                                            </span>
                                        </div>

                                        {/* Category */}
                                        {store.category && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                                                    {store.category}
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button className="w-full btn-primary text-sm">
                                            View Store →
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stores;
