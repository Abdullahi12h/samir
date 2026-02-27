import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        const { default: User } = await import('file://' + path.resolve('models/User.js'));
        const users = await User.find({}, 'username role').lean();
        console.log(users);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listUsers();
