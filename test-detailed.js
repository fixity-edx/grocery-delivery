const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const detailedTest = async () => {
    console.log('🔍 Running Detailed API Diagnostics...\n');

    try {
        // Test 1: Register User
        console.log('1. Testing User Registration...');
        const userRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Test User',
            email: `user${Date.now()}@test.com`,
            password: 'password123',
            phone: '1234567890',
            role: 'user'
        });
        const userToken = userRes.data.data.token;
        console.log('✅ User registered, token:', userToken.substring(0, 20) + '...\n');

        // Test 2: Get Profile
        console.log('2. Testing Get Profile...');
        const profileRes = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Profile:', profileRes.data.data.name, '\n');

        // Test 3: Add Address
        console.log('3. Testing Add Address...');
        try {
            const addressRes = await axios.post(`${BASE_URL}/users/address`, {
                street: '123 Test St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                label: 'home'
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            console.log('✅ Address added\n');
        } catch (error) {
            console.log('❌ Add address failed:', error.response?.data?.message || error.message);
            console.log('   Status:', error.response?.status);
            console.log('   URL:', error.config?.url, '\n');
        }

        // Test 4: Get All Stores
        console.log('4. Testing Get All Stores...');
        try {
            const storesRes = await axios.get(`${BASE_URL}/stores`);
            console.log('✅ Stores:', storesRes.data.data.length, 'found\n');
        } catch (error) {
            console.log('❌ Get stores failed:', error.response?.data?.message || error.message, '\n');
        }

        // Test 5: Get All Products
        console.log('5. Testing Get All Products...');
        try {
            const productsRes = await axios.get(`${BASE_URL}/products`);
            console.log('✅ Products:', productsRes.data.data.length, 'found\n');
        } catch (error) {
            console.log('❌ Get products failed:', error.response?.data?.message || error.message, '\n');
        }

        // Test 6: Admin Login
        console.log('6. Testing Admin Login...');
        try {
            const adminRes = await axios.post(`${BASE_URL}/auth/admin-login`, {
                email: 'admin@gmail.com',
                password: 'admin123'
            });
            const adminToken = adminRes.data.data.token;
            console.log('✅ Admin logged in, token:', adminToken.substring(0, 20) + '...\n');

            // Test 7: Admin Get Users
            console.log('7. Testing Admin Get All Users...');
            try {
                const usersRes = await axios.get(`${BASE_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                console.log('✅ Users:', usersRes.data.data.length, 'found\n');
            } catch (error) {
                console.log('❌ Admin get users failed:', error.response?.data?.message || error.message);
                console.log('   Status:', error.response?.status);
                console.log('   URL:', error.config?.url, '\n');
            }
        } catch (error) {
            console.log('❌ Admin login failed:', error.response?.data?.message || error.message, '\n');
        }

    } catch (error) {
        console.log('❌ Fatal error:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }
    }
};

detailedTest();
