import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await api.users.getProfile();
            setWishlist(response.data.data.wishlist || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await api.users.removeFromWishlist(productId);
            await fetchWishlist();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove from wishlist');
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                    <p className="text-gray-600">{wishlist.length} item(s) saved</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-8xl mb-6">❤️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-8">Save your favorite products here!</p>
                        <Link to="/stores" className="btn-primary inline-block">
                            Browse Stores
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div key={product._id} className="card hover:shadow-lg transition-shadow">
                                <div className="h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <span className="text-5xl">📦</span>
                                    )}
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.unit}</p>
                                <p className="text-lg font-bold text-primary-600 mb-3">₹{product.price}</p>

                                {product.stock > 0 ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => addToCart(product._id)}
                                            className="w-full btn-primary text-sm"
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => removeFromWishlist(product._id)}
                                            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-red-600 text-center">Out of Stock</p>
                                        <button
                                            onClick={() => removeFromWishlist(product._id)}
                                            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-semibold"
                                        >
                                            Remove
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

export default Wishlist;
