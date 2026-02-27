import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        const db = mongoose.connection.db;

        console.log('--- Student Indexes ---');
        const studentIndexes = await db.collection('students').indexes();
        console.log(JSON.stringify(studentIndexes, null, 2));

        const fs = await import('fs');
        const output = {
            students: studentIndexes,
            users: userIndexes
        };
        fs.writeFileSync('indexes_dump.json', JSON.stringify(output, null, 2));
        console.log('Indexes written to indexes_dump.json');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkIndexes();
