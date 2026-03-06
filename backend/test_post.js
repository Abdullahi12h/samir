import axios from 'axios';

async function testPost() {
    try {
        const res = await axios.post('http://localhost:5000/api/management/fees', {
            studentId: "69aa5f8ed9c7b7571c7e9db8",
            amount: 50,
            month: 3,
            year: 2026,
            status: "Pending"
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.log('Error:', err.response?.data || err.message);
    }
}

testPost();
