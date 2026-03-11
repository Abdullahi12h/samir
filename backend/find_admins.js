import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const findAdmins = async () => {
    try {
        await connectDB();
        const admins = await User.find({ role: 'Admin' });
        console.log('ADMINS:', JSON.stringify(admins, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error finding admins:', err);
        process.exit(1);
    }
};
findAdmins();
