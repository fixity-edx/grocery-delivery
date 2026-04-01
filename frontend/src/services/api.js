import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin-login', data),
    getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    addAddress: (data) => api.post('/users/addresses', data),
    updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
    getWishlist: () => api.get('/users/wishlist'),
    addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
    removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
};

// Store API
export const storeAPI = {
    getAll: (params) => api.get('/stores', { params }),
    getById: (id) => api.get(`/stores/${id}`),
    getNearby: (params) => api.get('/stores/nearby', { params }),
    create: (data) => api.post('/stores', data),
    update: (id, data) => api.put(`/stores/${id}`, data),
    delete: (id) => api.delete(`/stores/${id}`),
    getMyStores: () => api.get('/stores/vendor/my-stores'),
};

// Product API
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getByStore: (storeId) => api.get(`/products/store/${storeId}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    generateAIDescription: (data) => api.post('/products/ai-description', data),
    getLowStock: (storeId) => api.get(`/products/low-stock/${storeId}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart/add', data),
    update: (data) => api.put('/cart/update', data),
    remove: (productId) => api.delete(`/cart/remove/${productId}`),
    clear: () => api.delete('/cart/clear'),
};

// Order API
export const orderAPI = {
    create: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    getById: (id) => api.get(`/orders/${id}`),
    getVendorOrders: (storeId, params) => api.get(`/orders/vendor/${storeId}`, { params }),
    getMyDeliveries: (params) => api.get('/orders/delivery/my-deliveries', { params }),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    assignDelivery: (id, data) => api.put(`/orders/${id}/assign-delivery`, data),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Promotion API
export const promotionAPI = {
    getAll: () => api.get('/promotions'),
    getById: (id) => api.get(`/promotions/${id}`),
    validate: (data) => api.post('/promotions/validate', data),
    create: (data) => api.post('/promotions', data),
    update: (id, data) => api.put(`/promotions/${id}`, data),
    delete: (id) => api.delete(`/promotions/${id}`),
};

// AI API
export const aiAPI = {
    generateProductDescription: (data) => api.post('/ai/product-description', data),
    generatePromotionSuggestions: (data) => api.post('/ai/promotion-suggestions', data),
    forecastDemand: (data) => api.post('/ai/forecast-demand', data),
    optimizePricing: (data) => api.post('/ai/optimize-pricing', data),
    getRecommendations: () => api.get('/ai/recommendations'),
    getBudgetTips: () => api.get('/ai/budget-tips'),
    analyzeFraud: (data) => api.post('/ai/fraud-detection', data),
    analyzeSalesTrends: (data) => api.post('/ai/sales-trends', data),
    analyzeStorePerformance: (data) => api.post('/ai/store-performance', data),
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getAllStores: () => api.get('/stores', { params: { isApproved: 'all' } }),
    getAllOrders: (params) => api.get('/admin/orders', { params }),
    toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
    getPendingStores: () => api.get('/admin/stores/pending'),
    approveStore: (id, data) => api.put(`/admin/stores/${id}/approve`, data),
    getOrders: (params) => api.get('/admin/orders', { params }),
};

// Analytics API
export const analyticsAPI = {
    getPlatformAnalytics: (params) => api.get('/analytics/platform', { params }),
    getStoreAnalytics: (storeId, params) => api.get(`/analytics/store/${storeId}`, { params }),
};

// Attach APIs to default export for backwards compatibility/convenience
api.auth = authAPI;
api.users = userAPI;
api.stores = storeAPI;
api.products = productAPI;
api.cart = cartAPI;
api.orders = orderAPI;
api.promotions = promotionAPI;
api.ai = aiAPI;
api.admin = {
    ...adminAPI,
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getAllStores: () => api.get('/stores', { params: { isApproved: 'all' } }),
    getAllOrders: (params) => api.get('/admin/orders', { params }),
};
api.analytics = analyticsAPI;

export default api;
