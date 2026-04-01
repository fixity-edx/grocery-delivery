import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">🛒</span>
                            </div>
                            <span className="text-2xl font-bold">GroceryHub</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Your hyperlocal grocery delivery platform powered by AI
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/stores" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Browse Stores
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Sign Up
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Vendors */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">For Vendors</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/register" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Become a Vendor
                                </Link>
                            </li>
                            <li>
                                <Link to="/vendor/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Vendor Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Email: support@groceryhub.com</li>
                            <li>Phone: +91 1234567890</li>
                            <li>Address: Mumbai, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2026 GroceryHub. All rights reserved. Powered by AI.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
