import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const username = 'admin';
        const password = 'admin123';

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`User "${username}" already exists.`);
            // Update password just in case
            existingUser.password = password;
            await existingUser.save();
            console.log(`Password for "${username}" has been updated to "${password}".`);
        } else {
            await User.create({
                name: 'System Admin',
                username,
                password,
                role: 'Admin'
            });
            console.log(`Admin user created!`);
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
