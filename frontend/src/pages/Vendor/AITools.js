import React, { useState } from 'react';
import api from '../../services/api';

const AITools = () => {
    const [activeTab, setActiveTab] = useState('demand');
    const [loading, setLoading] = useState(false);
    const [demandForecast, setDemandForecast] = useState(null);
    const [pricingOptimization, setPricingOptimization] = useState(null);
    const [promotionSuggestions, setPromotionSuggestions] = useState(null);
    const [performanceAnalysis, setPerformanceAnalysis] = useState(null);

    const getDemandForecast = async () => {
        try {
            setLoading(true);
            const response = await api.ai.forecastDemand({
                productData: { name: 'Assorted Groceries', category: 'General' },
                historicalSales: { last7Days: 150, last30Days: 600 }
            });
            setDemandForecast(response.data.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to get forecast');
        } finally {
            setLoading(false);
        }
    };

    const getPricingOptimization = async () => {
        try {
            setLoading(true);
            const response = await api.ai.optimizePricing({
                productData: { name: 'Premium Rice', price: 85, costPrice: 60, stock: 100 },
                competitorPrices: [80, 90, 88],
                salesData: { monthlySales: 500 }
            });
            setPricingOptimization(response.data.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to get pricing');
        } finally {
            setLoading(false);
        }
    };

    const getPromotionSuggestions = async () => {
        try {
            setLoading(true);
            const response = await api.ai.generatePromotionSuggestions({
                storeData: { category: 'Supermarket' },
                salesData: { avgOrderValue: 1200, topCategories: ['Dairy', 'Bakery'] }
            });
            setPromotionSuggestions(response.data.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to get suggestions');
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceAnalysis = async () => {
        try {
            setLoading(true);
            const response = await api.ai.analyzeStorePerformance({
                storeId: 'sample',
                name: 'My Store',
                revenue: 50000,
                orders: 150,
                rating: 4.8,
                avgDeliveryTime: 25,
                retentionRate: 85
            });
            setPerformanceAnalysis(response.data.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to get analysis');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🤖</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Business Tools</h1>
                    <p className="text-gray-600">Grow your business with AI-powered insights</p>
                </div>

                {/* Tabs */}
                <div className="card mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { key: 'demand', label: '📈 Demand', icon: '📈' },
                            { key: 'pricing', label: '💰 Pricing', icon: '💰' },
                            { key: 'promotions', label: '🎯 Promotions', icon: '🎯' },
                            { key: 'performance', label: '📊 Performance', icon: '📊' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-3 rounded-lg font-semibold text-sm ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="card">
                    {activeTab === 'demand' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Demand Forecasting</h2>
                            <p className="text-gray-600 mb-6">Predict future demand for your products</p>
                            {!demandForecast ? (
                                <button onClick={getDemandForecast} disabled={loading} className="btn-primary disabled:opacity-50">
                                    {loading ? 'Analyzing...' : 'Get Forecast'}
                                </button>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{demandForecast.forecast}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing Optimization</h2>
                            <p className="text-gray-600 mb-6">Get AI recommendations for optimal pricing</p>
                            {!pricingOptimization ? (
                                <button onClick={getPricingOptimization} disabled={loading} className="btn-primary disabled:opacity-50">
                                    {loading ? 'Analyzing...' : 'Optimize Pricing'}
                                </button>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{pricingOptimization.optimization}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'promotions' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Promotion Suggestions</h2>
                            <p className="text-gray-600 mb-6">AI-powered promotion ideas to boost sales</p>
                            {!promotionSuggestions ? (
                                <button onClick={getPromotionSuggestions} disabled={loading} className="btn-primary disabled:opacity-50">
                                    {loading ? 'Generating...' : 'Get Suggestions'}
                                </button>
                            ) : (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{promotionSuggestions.suggestions}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Analysis</h2>
                            <p className="text-gray-600 mb-6">Comprehensive analysis of your store's performance</p>
                            {!performanceAnalysis ? (
                                <button onClick={getPerformanceAnalysis} disabled={loading} className="btn-primary disabled:opacity-50">
                                    {loading ? 'Analyzing...' : 'Analyze Performance'}
                                </button>
                            ) : (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{performanceAnalysis.analysis}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AITools;
