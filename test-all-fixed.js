const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let userToken = '';
let vendorToken = '';
let adminToken = '';
let storeId = '';
let productId = '';
let addressId = '';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const testAllEndpoints = async () => {
    log('\n🔍 DETAILED API ENDPOINT TESTING\n', 'cyan');
    let passed = 0;
    let failed = 0;
    const failures = [];

    try {
        // 1. User Registration
        log('1️⃣  User Registration...', 'blue');
        try {
            const userRes = await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test User',
                email: `user${Date.now()}@test.com`,
                password: 'password123',
                phone: '1234567890',
                role: 'user'
            });
            userToken = userRes.data.data.token;
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'User Registration', error: error.response?.data || error.message });
            failed++;
        }

        // 2. Vendor Registration
        log('2️⃣  Vendor Registration...', 'blue');
        try {
            const vendorRes = await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test Vendor',
                email: `vendor${Date.now()}@test.com`,
                password: 'password123',
                phone: '9876543210',
                role: 'vendor'
            });
            vendorToken = vendorRes.data.data.token;
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Vendor Registration', error: error.response?.data || error.message });
            failed++;
        }

        // 3. Admin Login
        log('3️⃣  Admin Login...', 'blue');
        try {
            const adminRes = await axios.post(`${BASE_URL}/auth/admin-login`, {
                email: 'admin@gmail.com',
                password: 'admin123'
            });
            adminToken = adminRes.data.data.token;
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Admin Login', error: error.response?.data || error.message });
            failed++;
        }

        // 4. Get User Profile
        log('4️⃣  Get User Profile...', 'blue');
        try {
            await axios.get(`${BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Get User Profile', error: error.response?.data || error.message });
            failed++;
        }

        // 5. Add Address (FIXED PATH)
        log('5️⃣  Add Address...', 'blue');
        try {
            const addressRes = await axios.post(`${BASE_URL}/users/addresses`, {
                street: '123 Test Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                label: 'home'
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            const addresses = addressRes.data.data.addresses || addressRes.data.data;
            addressId = Array.isArray(addresses) ? addresses[addresses.length - 1]._id : addresses._id;
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Add Address', error: error.response?.data || error.message });
            failed++;
        }

        // 6. Create Store
        log('6️⃣  Create Store...', 'blue');
        try {
            const storeRes = await axios.post(`${BASE_URL}/stores`, {
                name: 'Test Grocery Store',
                description: 'A test grocery store',
                category: 'Grocery',
                address: {
                    street: '456 Market Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400002',
                    coordinates: { lat: 19.0760, lng: 72.8777 }
                },
                contact: {
                    phone: '9876543210'
                }
            }, {
                headers: { Authorization: `Bearer ${vendorToken}` }
            });
            storeId = storeRes.data.data._id;
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Create Store', error: error.response?.data || error.message });
            failed++;
        }

        // 7. Get All Stores
        log('7️⃣  Get All Stores...', 'blue');
        try {
            await axios.get(`${BASE_URL}/stores`);
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Get All Stores', error: error.response?.data || error.message });
            failed++;
        }

        // 8. Approve Store (Admin)
        log('8️⃣  Approve Store (Admin)...', 'blue');
        try {
            await axios.put(`${BASE_URL}/admin/stores/${storeId}/approve`, {}, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Approve Store', error: error.response?.data || error.message });
            failed++;
        }

        // 9. Create Product
        log('9️⃣  Create Product...', 'blue');
        try {
            const productRes = await axios.post(`${BASE_URL}/products`, {
                name: 'Fresh Tomatoes',
                description: 'Organic farm-fresh tomatoes',
                category: 'vegetables',
                price: 40,
                stock: 100,
                unit: 'kg',
                storeId: storeId,
                brand: 'FreshFarm'
            }, {
                headers: { Authorization: `Bearer ${vendorToken}` }
            });
            productId = productRes.data.data._id;
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Create Product', error: error.response?.data || error.message });
            failed++;
        }

        // 10. Get All Products
        log('🔟 Get All Products...', 'blue');
        try {
            await axios.get(`${BASE_URL}/products`);
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Get All Products', error: error.response?.data || error.message });
            failed++;
        }

        // 11. Add to Cart (FIXED)
        log('1️⃣1️⃣  Add to Cart...', 'blue');
        try {
            await axios.post(`${BASE_URL}/cart/add`, {
                productId: productId,
                quantity: 2
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Add to Cart', error: error.response?.data || error.message });
            failed++;
        }

        // 12. Get Cart
        log('1️⃣2️⃣  Get Cart...', 'blue');
        try {
            await axios.get(`${BASE_URL}/cart`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Get Cart', error: error.response?.data || error.message });
            failed++;
        }

        // 13. Add to Wishlist (FIXED)
        log('1️⃣3️⃣  Add to Wishlist...', 'blue');
        try {
            await axios.post(`${BASE_URL}/users/wishlist/${productId}`, {}, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Add to Wishlist', error: error.response?.data || error.message });
            failed++;
        }

        // 14. Create Order
        log('1️⃣4️⃣  Create Order...', 'blue');
        try {
            await axios.post(`${BASE_URL}/orders`, {
                storeId: storeId,
                deliveryAddress: addressId,
                paymentMethod: 'COD'
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Create Order', error: error.response?.data || error.message });
            failed++;
        }

        // 15. Get My Orders
        log('1️⃣5️⃣  Get My Orders...', 'blue');
        try {
            await axios.get(`${BASE_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Get My Orders', error: error.response?.data || error.message });
            failed++;
        }

        // 16. AI Recommendations
        log('1️⃣6️⃣  AI Recommendations...', 'blue');
        try {
            await axios.get(`${BASE_URL}/ai/recommendations`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'AI Recommendations', error: error.response?.data || error.message });
            failed++;
        }

        // 17. Admin Get All Users
        log('1️⃣7️⃣  Admin Get All Users...', 'blue');
        try {
            await axios.get(`${BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Admin Get All Users', error: error.response?.data || error.message });
            failed++;
        }

        // 18. Admin Get All Orders
        log('1️⃣8️⃣  Admin Get All Orders...', 'blue');
        try {
            await axios.get(`${BASE_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log('✅ PASS', 'green');
            passed++;
        } catch (error) {
            log(`❌ FAIL: ${error.response?.data?.message || error.message}`, 'red');
            failures.push({ test: 'Admin Get All Orders', error: error.response?.data || error.message });
            failed++;
        }

        // Summary
        log('\n' + '='.repeat(60), 'cyan');
        log('📊 DETAILED TEST SUMMARY', 'cyan');
        log('='.repeat(60), 'cyan');
        log(`✅ Passed: ${passed}`, 'green');
        log(`❌ Failed: ${failed}`, 'red');
        log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`, 'yellow');
        log('='.repeat(60) + '\n', 'cyan');

        if (failures.length > 0) {
            log('❌ FAILED TESTS DETAILS:\n', 'red');
            failures.forEach((f, i) => {
                log(`${i + 1}. ${f.test}`, 'yellow');
                log(`   Error: ${JSON.stringify(f.error, null, 2)}\n`, 'red');
            });
        }

        if (failed === 0) {
            log('🎉 ALL TESTS PASSED! Your API is 100% functional!', 'green');
        } else {
            log(`⚠️  ${failed} test(s) need fixing.`, 'yellow');
        }

    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
    }
};

testAllEndpoints();
