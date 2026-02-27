import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkRecentActivity = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        const db = mongoose.connection.db;

        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

        const recentUsers = await db.collection('users').find({ createdAt: { $gte: tenMinsAgo } }).toArray();
        console.log('--- Recent Users ---');
        console.log(JSON.stringify(recentUsers, null, 2));

        const recentStudents = await db.collection('students').find({ createdAt: { $gte: tenMinsAgo } }).toArray();
        console.log('--- Recent Students ---');
        console.log(JSON.stringify(recentStudents, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkRecentActivity();
