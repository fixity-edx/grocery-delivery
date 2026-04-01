import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'vendor':
                return '/vendor/dashboard';
            case 'delivery':
                return '/delivery/dashboard';
            default:
                return '/dashboard';
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">🛒</span>
                            </div>
                            <span className="text-2xl font-bold text-gradient">GroceryHub</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/stores" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                            Stores
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                    Dashboard
                                </Link>

                                {user.role === 'user' && (
                                    <>
                                        <Link to="/cart" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                            Cart
                                        </Link>
                                        <Link to="/orders" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                            Orders
                                        </Link>
                                        <Link to="/ai-assistant" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                            AI Assistant
                                        </Link>
                                    </>
                                )}

                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span>{user.name}</span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-t-lg">
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 hover:text-primary-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link to="/stores" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                            Stores
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to={getDashboardLink()} className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                                    Dashboard
                                </Link>
                                {user.role === 'user' && (
                                    <>
                                        <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                                            Cart
                                        </Link>
                                        <Link to="/orders" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                                            Orders
                                        </Link>
                                    </>
                                )}
                                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-primary-50 rounded-md">
                                    Login
                                </Link>
                                <Link to="/register" className="block px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-md font-semibold">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
