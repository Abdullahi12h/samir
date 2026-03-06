import mongoose from 'mongoose';
import StudentPayment from './backend/models/StudentPayment.js';
import dotenv from 'dotenv';
dotenv.config();

const check = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/school_management' || process.env.MONGO_URI);
        const payments = await StudentPayment.find({});
        console.log('Total StudentPayment records:', payments.length);
        const total = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        console.log('Sum of amounts:', total);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
