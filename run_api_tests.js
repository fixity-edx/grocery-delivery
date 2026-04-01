const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';

// Helper to log results
const logResult = (testName, success, message = '') => {
    const status = success ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${testName} ${message ? '- ' + message : ''}`);
};

// Global variables to store IDs and Tokens
let vendorToken, userToken, deliveryToken;
let vendorId, userId, deliveryId;
let storeId, productId, orderId, cartItemId;
let addressId; // Add this line

// Unique email generator
const uniqueId = Date.now();
const vendorEmail = `vendor${uniqueId}@test.com`;
const userEmail = `user${uniqueId}@test.com`;
const deliveryEmail = `delivery${uniqueId}@test.com`;
const password = 'password123';

async function runTests() {
    console.log('Starting API Tests...');

    try {
        // 1. Auth Tests
        console.log('\n--- Auth Tests ---');

        // Register Vendor
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Vendor',
                email: vendorEmail,
                password,
                phone: '1234567890',
                role: 'vendor'
            });
            logResult('Register Vendor', true);
        } catch (e) {
            logResult('Register Vendor', false, e.response?.data?.message || e.message);
        }

        // Login Vendor
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email: vendorEmail, password });
            vendorToken = res.data.data.token;
            vendorId = res.data.data._id;
            logResult('Login Vendor', true);
        } catch (e) {
            logResult('Login Vendor', false, e.response?.data?.message || e.message);
        }

        // Register User
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User',
                email: userEmail,
                password,
                phone: '0987654321',
                role: 'user'
            });
            logResult('Register User', true);
        } catch (e) {
            logResult('Register User', false, e.response?.data?.message || e.message);
        }

        // Login User
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email: userEmail, password });
            userToken = res.data.data.token;
            userId = res.data.data._id;
            logResult('Login User', true);
        } catch (e) {
            logResult('Login User', false, e.response?.data?.message || e.message);
        }

        // Register Delivery
        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Delivery',
                email: deliveryEmail,
                password,
                phone: '1122334455',
                role: 'delivery'
            });
            logResult('Register Delivery', true);
        } catch (e) {
            logResult('Register Delivery', false, e.response?.data?.message || e.message);
        }

        // Login Delivery
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email: deliveryEmail, password });
            deliveryToken = res.data.data.token;
            deliveryId = res.data.data._id;
            logResult('Login Delivery', true);
        } catch (e) {
            logResult('Login Delivery', false, e.response?.data?.message || e.message);
        }


        // 2. Store Tests
        console.log('\n--- Store Tests ---');
        if (vendorToken) {
            try {
                const res = await axios.post(`${API_URL}/stores`, {
                    name: `Test Store ${uniqueId}`,
                    category: 'Grocery',
                    description: 'A test store',
                    address: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'Test State',
                        pincode: '123456',
                        coordinates: { lat: 10, lng: 20 }
                    },
                    contact: { phone: '1234567890', email: vendorEmail }
                }, { headers: { Authorization: `Bearer ${vendorToken}` } });
                storeId = res.data.data._id;
                logResult('Create Store', true);
            } catch (e) {
                logResult('Create Store', false, e.response?.data?.message || e.message);
            }
        }

        // 3. Product Tests
        console.log('\n--- Product Tests ---');
        if (vendorToken && storeId) {
            try {
                const res = await axios.post(`${API_URL}/products`, {
                    name: 'Test Product',
                    description: 'Test Description',
                    category: 'Vegetables',
                    price: 100,
                    unit: 'kg',
                    stock: 50,
                    storeId: storeId
                }, { headers: { Authorization: `Bearer ${vendorToken}` } });
                productId = res.data.data._id;
                logResult('Create Product', true);
            } catch (e) {
                logResult('Create Product', false, e.response?.data?.message || e.message);
            }
        }

        // 4. Cart Tests
        console.log('\n--- Cart Tests ---');
        if (userToken && productId) {
            // Add to Cart
            try {
                const res = await axios.post(`${API_URL}/cart/add`, {
                    productId: productId,
                    quantity: 2
                }, { headers: { Authorization: `Bearer ${userToken}` } });
                logResult('Add to Cart', true);
            } catch (e) {
                logResult('Add to Cart', false, e.response?.data?.message || e.message);
            }

            // Get Cart
            try {
                const res = await axios.get(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${userToken}` } });
                if (res.data.data.items.length > 0) {
                    logResult('Get Cart', true);
                } else {
                    logResult('Get Cart', false, 'Cart is empty');
                }
            } catch (e) {
                logResult('Get Cart', false, e.response?.data?.message || e.message);
            }
        }

        // 5. User Address Test (Prepare for Order)
        console.log('\n--- User Address Tests ---');
        if (userToken) {
            try {
                const res = await axios.post(`${API_URL}/users/addresses`, {
                    street: '456 User St',
                    city: 'User City',
                    state: 'User State',
                    pincode: '654321',
                    label: 'home'
                }, { headers: { Authorization: `Bearer ${userToken}` } });
                // Assuming the response returns the updated user profile or the address object
                // Let's verify structure by fetching profile if needed, but response usually has data
                const addresses = res.data.data; // Based on typical controller response
                // If it returns the array of addresses, pick the last one
                if (Array.isArray(addresses)) {
                    addressId = addresses[addresses.length - 1]._id;
                } else {
                    // Fallback in case it returns the profile object
                    addressId = addresses.addresses[addresses.addresses.length - 1]._id;
                }
                logResult('Add Address', true);
            } catch (e) {
                logResult('Add Address', false, e.response?.data?.message || e.message);
            }
        }

        // 6. Order Tests
        console.log('\n--- Order Tests ---');
        if (userToken && storeId && addressId) {
            // Place Order
            try {
                // Fetch full address object first as per our fix
                const profileRes = await axios.get(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${userToken}` } });
                const fullAddress = profileRes.data.data.addresses.find(a => a._id === addressId);

                const res = await axios.post(`${API_URL}/orders`, {
                    storeId: storeId,
                    deliveryAddress: fullAddress,
                    paymentMethod: 'COD'
                }, { headers: { Authorization: `Bearer ${userToken}` } });
                orderId = res.data.data._id;
                logResult('Place Order', true);
            } catch (e) {
                console.log(e.response?.data);
                logResult('Place Order', false, e.response?.data?.message || e.message);
            }

            // Get My Orders
            try {
                const res = await axios.get(`${API_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${userToken}` } });
                logResult('Get My Orders', true);
            } catch (e) {
                logResult('Get My Orders', false, e.response?.data?.message || e.message);
            }
        }

        // 7. Vendor Order Management
        console.log('\n--- Vendor Order Tests ---');
        if (vendorToken && storeId && orderId) {
            // Get Vendor Orders
            try {
                const res = await axios.get(`${API_URL}/orders/vendor/${storeId}`, { headers: { Authorization: `Bearer ${vendorToken}` } });
                logResult('Get Vendor Orders', true);
            } catch (e) {
                logResult('Get Vendor Orders', false, e.response?.data?.message || e.message);
            }

            // Assign Delivery Partner
            if (deliveryId) {
                try {
                    await axios.put(`${API_URL}/orders/${orderId}/assign-delivery`, {
                        deliveryPartnerId: deliveryId
                    }, { headers: { Authorization: `Bearer ${vendorToken}` } });
                    logResult('Assign Delivery Partner', true);
                } catch (e) {
                    logResult('Assign Delivery Partner', false, e.response?.data?.message || e.message);
                }
            }
        }

        // 8. Delivery Tests
        console.log('\n--- Delivery Tests ---');
        if (deliveryToken) {
            try {
                const res = await axios.get(`${API_URL}/orders/delivery/my-deliveries`, { headers: { Authorization: `Bearer ${deliveryToken}` } });
                logResult('Get My Deliveries', true);
            } catch (e) {
                logResult('Get My Deliveries', false, e.response?.data?.message || e.message);
            }
        }


    } catch (error) {
        console.error('Test Suite Failed:', error);
    }
}

runTests();
