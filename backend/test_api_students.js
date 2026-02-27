import axios from 'axios';

const testApi = async () => {
    try {
        // We don't have a token here, but we can check if the route returns 401 or something else
        // Actually, let's just use the 'api' logic but simplified
        const res = await axios.get('http://localhost:5001/api/users/students?status=Active');
        console.log('Status Code:', res.status);
        console.log('Data Length:', res.data.length);
        console.log('First Item Status:', res.data[0]?.status);
    } catch (error) {
        console.log('Error Status:', error.response?.status);
        console.log('Error Message:', error.response?.data?.message || error.message);
    }
};

testApi();
