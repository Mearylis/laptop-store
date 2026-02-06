const axios = require('axios');

const testRegister = async () => {
    const userData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890'
    };

    console.log('Attempting to register with data:', userData);

    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', userData);
        console.log('✅ Registration SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('❌ Registration FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received (Network Error)');
        } else {
            console.error('Error:', error.message);
        }
    }
};

testRegister();
