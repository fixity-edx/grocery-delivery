import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
        fetchProduct();
        checkWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.products.getById(id);
            setProduct(response.data.data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkWishlist = async () => {
        try {
            const response = await api.users.getProfile();
            const wishlist = response.data.data.wishlist || [];
            setInWishlist(wishlist.some(item => item._id === id));
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const addToCart = async () => {
        try {
            await api.cart.add({ productId: id, quantity });
            alert('Added to cart!');
            navigate('/cart');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const toggleWishlist = async () => {
        try {
            if (inWishlist) {
                await api.users.removeFromWishlist(id);
                setInWishlist(false);
                alert('Removed from wishlist');
            } else {
                await api.users.addToWishlist(id);
                setInWishlist(true);
                alert('Added to wishlist');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update wishlist');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                    <Link to="/stores" className="btn-primary">Browse Stores</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to={`/stores/${product.store?._id}`} className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block">
                    ← Back to Store
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="card">
                        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <span className="text-9xl">📦</span>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="card mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                    <p className="text-gray-600">{product.category}</p>
                                </div>
                                <button
                                    onClick={toggleWishlist}
                                    className={`text-3xl ${inWishlist ? 'text-red-500' : 'text-gray-300'} hover:scale-110 transition-transform`}
                                >
                                    {inWishlist ? '❤️' : '🤍'}
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-4xl font-bold text-primary-600 mb-2">₹{product.price}</p>
                                <p className="text-sm text-gray-600">{product.unit}</p>
                            </div>

                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700">{product.description}</p>
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <div>
                                        <p className="text-green-600 font-semibold mb-2">✓ In Stock ({product.stock} available)</p>
                                        {product.stock < 10 && (
                                            <p className="text-orange-600 text-sm">Only {product.stock} left - Order soon!</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-red-600 font-semibold">✗ Out of Stock</p>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                                        >
                                            −
                                        </button>
                                        <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <Link to="/cart" className="block w-full text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">
                                    View Cart
                                </Link>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Category</span>
                                    <span className="font-semibold text-gray-900">{product.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unit</span>
                                    <span className="font-semibold text-gray-900">{product.unit}</span>
                                </div>
                                {product.brand && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Brand</span>
                                        <span className="font-semibold text-gray-900">{product.brand}</span>
                                    </div>
                                )}
                                {product.tags && product.tags.length > 0 && (
                                    <div>
                                        <span className="text-gray-600 block mb-2">Tags</span>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
