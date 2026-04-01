import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const StoreDetail = () => {
    const { id } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchStoreData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchStoreData = async () => {
        try {
            setLoading(true);
            const [storeRes, productsRes] = await Promise.all([
                api.stores.getById(id),
                api.products.getByStore(id)
            ]);
            setStore(storeRes.data.data);
            setProducts(productsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching store data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId) => {
        try {
            await api.cart.add({ productId, quantity: 1 });
            alert('Added to cart!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory && product.isAvailable;
    });

    const categories = [...new Set(products.map(p => p.category))];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Store not found</h2>
                    <Link to="/stores" className="btn-primary">Back to Stores</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Store Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link to="/stores" className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block">
                        ← Back to Stores
                    </Link>
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-5xl">{store.logo || '🏪'}</span>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
                            <p className="text-gray-600 mb-3">{store.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span>⭐</span>
                                    <span>{store.rating?.average?.toFixed(1) || '0.0'} ({store.rating?.count || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>{store.address?.street}, {store.address?.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📞</span>
                                    <span>{store.contactNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter */}
                <div className="card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="card hover:shadow-lg transition-shadow">
                                <div className="h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                    <span className="text-5xl">📦</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.unit}</p>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
                                    {product.stock < 10 && (
                                        <span className="text-xs text-orange-600">Only {product.stock} left</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => addToCart(product._id)}
                                    disabled={product.stock === 0}
                                    className="w-full btn-primary text-sm disabled:opacity-50"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreDetail;
