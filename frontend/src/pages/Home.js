import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/login';
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
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="gradient-bg text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center animate-fade-in">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
                            Fresh Groceries Delivered
                            <br />
                            <span className="text-yellow-300">To Your Doorstep</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            AI-Powered Hyperlocal Grocery Delivery Platform
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isAuthenticated ? (
                                <Link to={getDashboardLink()} className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                        Get Started
                                    </Link>
                                    <Link to="/stores" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300">
                                        Browse Stores
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose GroceryHub?</h2>
                        <p className="text-xl text-gray-600">Experience the future of grocery shopping</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🤖</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">AI-Powered</h3>
                            <p className="text-gray-600">
                                Smart recommendations, budget optimization, and personalized shopping experience powered by advanced AI
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">⚡</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
                            <p className="text-gray-600">
                                Get your groceries delivered in 45 minutes or less from nearby local stores
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🏪</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Local Stores</h3>
                            <p className="text-gray-600">
                                Support your local businesses while enjoying fresh products and competitive prices
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">📱</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Real-Time Tracking</h3>
                            <p className="text-gray-600">
                                Track your order in real-time from preparation to delivery at your doorstep
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">💰</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Best Prices</h3>
                            <p className="text-gray-600">
                                AI-driven pricing optimization ensures you always get the best deals and offers
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card-hover p-8 text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🔒</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Secure Payments</h3>
                            <p className="text-gray-600">
                                Multiple payment options with secure transactions and wallet integration
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 gradient-bg text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start Shopping?</h2>
                    <p className="text-xl mb-8">
                        Join thousands of happy customers enjoying fresh groceries delivered fast
                    </p>
                    {!isAuthenticated && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg">
                                Sign Up Now
                            </Link>
                            <Link to="/admin-login" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300">
                                Admin Login
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">Local Stores</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
                            <div className="text-gray-600">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
                            <div className="text-gray-600">Orders Delivered</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">45min</div>
                            <div className="text-gray-600">Avg Delivery Time</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
