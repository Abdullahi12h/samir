import mongoose from 'mongoose';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import './models/User.js';
import './models/Student.js';
import './models/Class.js';
import Student from './models/Student.js';
import User from './models/User.js';

dotenv.config();

const find = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ name: /Nuux/i });
        if (!user) {
            console.log('User Nuux not found');
            process.exit(0);
        }
        const student = await Student.findOne({ user: user._id }).populate('user classId');
        console.log('STUDENT DATA:', JSON.stringify(student, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error in find script:', err);
        process.exit(1);
    }
};
find();
