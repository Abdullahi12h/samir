import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ name: /nadiifo/i });
        users.forEach(u => {
            console.log(`ID: ${u._id}, Username: ${u.username}, Name: ${u.name}, Role: ${u.role}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

run();
