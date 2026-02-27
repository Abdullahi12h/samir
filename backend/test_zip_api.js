async function testBackup() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'nadiifo',
                password: '12345678'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));
        console.log('Logged in successfully');

        console.log('Requesting full-zip...');
        const backupRes = await fetch('http://localhost:5001/api/backup/full-zip', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!backupRes.ok) {
            const text = await backupRes.text();
            console.error(`Backup failed (${backupRes.status}):`, text.slice(0, 500));
            return;
        }

        const buffer = await backupRes.arrayBuffer();
        console.log('Backup received. Size:', buffer.byteLength);

    } catch (err) {
        console.error('Test Error:', err.message);
    }
}

testBackup();
