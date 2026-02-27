import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminExists = await User.findOne({ email: 'admin@alkhid.com' });
        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@alkhid.com',
                password: 'password',
                role: 'Admin'
            });
            console.log('Admin user seeded (admin@alkhid.com / password)');
        } else {
            console.log('Admin already exists.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
