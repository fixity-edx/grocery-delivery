import React, { useState } from 'react';
import api from '../../services/api';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('recommendations');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [budgetTips, setBudgetTips] = useState(null);

    const getRecommendations = async () => {
        try {
            setLoading(true);
            const response = await api.ai.getRecommendations();
            setRecommendations(response.data.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    const getBudgetTips = async () => {
        try {
            setLoading(true);
            const response = await api.ai.getBudgetTips();
            setBudgetTips(response.data.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to get budget tips');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🤖</div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Shopping Assistant</h1>
                    <p className="text-gray-600">Get personalized recommendations and budget tips powered by AI</p>
                </div>

                {/* Tabs */}
                <div className="card mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('recommendations')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'recommendations'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🎯 Recommendations
                        </button>
                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'budget'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            💰 Budget Tips
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="card">
                    {activeTab === 'recommendations' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personalized Recommendations</h2>
                            <p className="text-gray-600 mb-6">
                                Get AI-powered product recommendations based on your shopping history and preferences.
                            </p>

                            {!recommendations ? (
                                <button
                                    onClick={getRecommendations}
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Generating...' : 'Get Recommendations'}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-primary-900 mb-2">AI Recommendations:</h3>
                                        <p className="text-gray-700 whitespace-pre-wrap">{recommendations.recommendations}</p>
                                    </div>
                                    <button
                                        onClick={getRecommendations}
                                        disabled={loading}
                                        className="btn-primary disabled:opacity-50"
                                    >
                                        {loading ? 'Generating...' : 'Get New Recommendations'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Optimization Tips</h2>
                            <p className="text-gray-600 mb-6">
                                Learn how to save money on your grocery shopping with AI-powered budget tips.
                            </p>

                            {!budgetTips ? (
                                <button
                                    onClick={getBudgetTips}
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Generating...' : 'Get Budget Tips'}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-900 mb-2">💡 Money-Saving Tips:</h3>
                                        <p className="text-gray-700 whitespace-pre-wrap">{budgetTips.tips}</p>
                                    </div>
                                    <button
                                        onClick={getBudgetTips}
                                        disabled={loading}
                                        className="btn-primary disabled:opacity-50"
                                    >
                                        {loading ? 'Generating...' : 'Get New Tips'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="card">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
                        <p className="text-sm text-gray-600">
                            AI analyzes your purchase history to suggest products you'll love
                        </p>
                    </div>
                    <div className="card">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Optimization</h3>
                        <p className="text-sm text-gray-600">
                            Get personalized tips to save money on your grocery shopping
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
