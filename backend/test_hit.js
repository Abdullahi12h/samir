const test = async () => {
    try {
        const res = await fetch('http://localhost:5001/api/core/skills');
        const data = await res.json();
        console.log('Backend response:', data);
    } catch (err) {
        console.error('Error hitting backend:', err.message);
    }
};

test();
