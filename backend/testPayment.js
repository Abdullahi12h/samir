import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudentPayment from './models/StudentPayment.js';

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testPayment = new StudentPayment({
            studentId: new mongoose.Types.ObjectId(), // Fake ID
            amount: 50,
            receiptNumber: `TEST-${Date.now()}`
        });

        await testPayment.validate();
        console.log('Validation passed!');
        process.exit(0);
    } catch (e) {
        console.error('Validation failed:', e);
        process.exit(1);
    }
};

runTest();
