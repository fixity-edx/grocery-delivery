const axios = require('axios');

const testConnection = async () => {
    try {
        console.log('Testing connection to http://localhost:5000/api...\n');

        const response = await axios.get('http://localhost:5000/api');
        console.log('✅ Server is responding!');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Server connection failed');
        console.log('Error:', error.message);
        if (error.code) console.log('Error Code:', error.code);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
};

testConnection();
