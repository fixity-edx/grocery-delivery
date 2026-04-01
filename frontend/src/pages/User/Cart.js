import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await api.cart.get();
            setCart(response.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            await removeItem(itemId);
            return;
        }

        try {
            setUpdating(true);
            await api.cart.update({ productId: itemId, quantity: newQuantity });
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert(error.response?.data?.message || 'Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (itemId) => {
        if (!window.confirm('Remove this item from cart?')) return;

        try {
            setUpdating(true);
            await api.cart.remove(itemId);
            await fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setUpdating(false);
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Clear all items from cart?')) return;

        try {
            setUpdating(true);
            await api.cart.clear();
            await fetchCart();
        } catch (error) {
            console.error('Error clearing cart:', error);
        } finally {
            setUpdating(false);
        }
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading cart...</p>
                </div>
            </div>
        );
    }

    const isEmpty = !cart?.items || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
                        <p className="text-gray-600 mt-2">
                            {isEmpty ? 'Your cart is empty' : `${cart.items.length} item(s) in cart`}
                        </p>
                    </div>
                    {!isEmpty && (
                        <button
                            onClick={clearCart}
                            disabled={updating}
                            className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {isEmpty ? (
                    <div className="card text-center py-16">
                        <div className="text-8xl mb-6">🛒</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add some items to get started!</p>
                        <Link to="/stores" className="btn-primary inline-block">
                            Browse Stores
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <div key={item._id} className="card">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {item.product?.images?.[0] ? (
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-4xl">📦</span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {item.product?.name || 'Product'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {item.product?.unit} • {item.product?.category}
                                            </p>
                                            <p className="text-lg font-bold text-primary-600">
                                                ₹{item.price}
                                            </p>
                                            {item.product?.stock < 10 && item.product?.stock > 0 && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    Only {item.product.stock} left in stock
                                                </p>
                                            )}
                                            {item.product?.stock === 0 && (
                                                <p className="text-xs text-red-600 mt-1">Out of stock</p>
                                            )}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeItem(item.product._id)}
                                                disabled={updating}
                                                className="text-red-600 hover:text-red-700 text-sm font-semibold disabled:opacity-50"
                                            >
                                                Remove
                                            </button>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                    disabled={updating || item.quantity <= 1}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="font-semibold text-gray-900 w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    disabled={updating || item.quantity >= (item.product?.stock || 0)}
                                                    className="w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <p className="text-sm font-semibold text-gray-900">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="card sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cart.items.length} items)</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (5%)</span>
                                        <span>₹{(calculateTotal() * 0.05).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{(calculateTotal() * 1.05).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    disabled={updating}
                                    className="w-full btn-primary disabled:opacity-50"
                                >
                                    Proceed to Checkout
                                </button>

                                <Link
                                    to="/stores"
                                    className="block text-center text-primary-600 hover:text-primary-700 font-semibold mt-4"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
