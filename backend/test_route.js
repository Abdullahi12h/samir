import dotenv from 'dotenv';
dotenv.config();

async function testFetch() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Ak',
                password: '123'
            })
        });

        const token = await loginRes.json();
        if (!token || !token.token) {
            console.log("Login failed or no token:", token);
            return;
        }

        console.log("Login success! Fetching users...");
        const res = await fetch('http://localhost:5001/api/users/all', {
            headers: { Authorization: `Bearer ${token.token}` }
        });

        const data = await res.json();
        console.log(`Fetched ${data.length} users successfully.`);
        console.log("First user:", data[0]);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

testFetch();
