import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        label: 'home'
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.users.getProfile();
            const data = response.data.data;
            setProfile(data);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone
            });
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.users.updateProfile(formData);
            alert('Profile updated successfully');
            setEditing(false);
            await fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const addAddress = async (e) => {
        e.preventDefault();
        try {
            await api.users.addAddress(newAddress);
            alert('Address added successfully');
            setShowAddressForm(false);
            setNewAddress({ street: '', city: '', state: '', pincode: '', label: 'home' });
            await fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add address');
        }
    };

    const deleteAddress = async (addressId) => {
        if (!window.confirm('Delete this address?')) return;

        try {
            await api.users.deleteAddress(addressId);
            alert('Address deleted successfully');
            await fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete address');
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

                {/* Profile Information */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={updateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary">Save Changes</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setFormData({
                                            name: profile.name,
                                            email: profile.email,
                                            phone: profile.phone
                                        });
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="text-lg font-semibold text-gray-900">{profile?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-lg font-semibold text-gray-900">{profile?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="text-lg font-semibold text-gray-900">{profile?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">{profile?.role}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                <p className="text-lg font-semibold text-green-600">₹{profile?.wallet?.balance || 0}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Saved Addresses */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                        {!showAddressForm && (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                + Add Address
                            </button>
                        )}
                    </div>

                    {showAddressForm && (
                        <form onSubmit={addAddress} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
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
                                    onClick={() => {
                                        setShowAddressForm(false);
                                        setNewAddress({ street: '', city: '', state: '', pincode: '', label: 'home' });
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {addresses.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">No saved addresses</p>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 capitalize mb-1">{address.label}</p>
                                            <p className="text-gray-700">
                                                {address.street}<br />
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteAddress(address._id)}
                                            className="text-red-600 hover:text-red-700 font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account Actions */}
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Actions</h2>
                    <div className="space-y-3">
                        <Link to="/orders" className="block w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                            📦 View Orders
                        </Link>
                        <Link to="/wishlist" className="block w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                            ❤️ View Wishlist
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
