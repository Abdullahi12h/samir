import connectDB from './config/db.js';
import ExamFee from './models/ExamFee.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    try {
        await connectDB();
        const count = await ExamFee.countDocuments();
        console.log('ExamFee count:', count);
        process.exit(0);
    } catch (err) {
        console.error('ERROR in test script:', err);
        process.exit(1);
    }
};
test();
