import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        label: 'home'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cartRes, profileRes] = await Promise.all([
                api.cart.get(),
                api.users.getProfile()
            ]);
            setCart(cartRes.data.data);
            setAddresses(profileRes.data.data.addresses || []);
            if (profileRes.data.data.addresses?.length > 0) {
                setSelectedAddress(profileRes.data.data.addresses[0]._id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addAddress = async (e) => {
        e.preventDefault();
        try {
            await api.users.addAddress(newAddress);
            await fetchData();
            setShowAddressForm(false);
            setNewAddress({ street: '', city: '', state: '', pincode: '', label: 'home' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add address');
        }
    };

    const placeOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        const address = addresses.find(addr => addr._id === selectedAddress);
        if (!address) {
            alert('Invalid address selected');
            return;
        }

        try {
            setPlacing(true);

            // Group items by store
            const itemsByStore = cart.items.reduce((acc, item) => {
                if (item.product && item.product.store) {
                    const storeId = item.product.store._id || item.product.store; // Handle both populated and unpopulated
                    if (!acc[storeId]) {
                        acc[storeId] = [];
                    }
                    acc[storeId].push(item);
                }
                return acc;
            }, {});

            const storeIds = Object.keys(itemsByStore);

            if (storeIds.length === 0) {
                alert('No valid items in cart');
                return;
            }

            const orders = [];
            for (const storeId of storeIds) {
                const response = await api.orders.create({
                    storeId,
                    deliveryAddress: address,
                    paymentMethod
                });
                orders.push(response.data.data);
            }

            alert('Order(s) placed successfully!');

            if (orders.length === 1) {
                navigate(`/orders/${orders[0]._id}`);
            } else {
                navigate('/orders');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                    <button onClick={() => navigate('/stores')} className="btn-primary">
                        Browse Stores
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Address</h2>

                            {addresses.length === 0 && !showAddressForm && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">No saved addresses</p>
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="btn-primary"
                                    >
                                        Add New Address
                                    </button>
                                </div>
                            )}

                            {addresses.length > 0 && !showAddressForm && (
                                <div className="space-y-3">
                                    {addresses.map(address => (
                                        <label
                                            key={address._id}
                                            className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${selectedAddress === address._id
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                value={address._id}
                                                checked={selectedAddress === address._id}
                                                onChange={(e) => setSelectedAddress(e.target.value)}
                                                className="mr-3"
                                            />
                                            <span className="font-semibold text-gray-900 capitalize">{address.label}</span>
                                            <p className="text-sm text-gray-600 mt-1 ml-6">
                                                {address.street}, {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </label>
                                    ))}
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="text-primary-600 hover:text-primary-700 font-semibold"
                                    >
                                        + Add New Address
                                    </button>
                                </div>
                            )}

                            {showAddressForm && (
                                <form onSubmit={addAddress} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                                        <select
                                            value={newAddress.label}
                                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="home">Home</option>
                                            <option value="work">Work</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            value={newAddress.street}
                                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                            <input
                                                type="text"
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            value={newAddress.pincode}
                                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="btn-primary">Save Address</button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressForm(false)}
                                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className={`block border-2 rounded-lg p-4 cursor-pointer ${paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="font-semibold">Cash on Delivery</span>
                                </label>
                                <label className={`block border-2 rounded-lg p-4 cursor-pointer ${paymentMethod === 'Online' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Online"
                                        checked={paymentMethod === 'Online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="font-semibold">Online Payment</span>
                                    <span className="text-sm text-gray-600 ml-2">(Coming Soon)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                {cart.items.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.product?.name} x{item.quantity}
                                        </span>
                                        <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span className="text-green-600">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (5%)</span>
                                    <span>₹{(calculateTotal() * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{(calculateTotal() * 1.05).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={placeOrder}
                                disabled={placing || !selectedAddress}
                                className="w-full btn-primary disabled:opacity-50"
                            >
                                {placing ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
