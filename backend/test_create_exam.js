import mongoose from 'mongoose';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import './models/User.js';
import './models/Student.js';
import './models/Class.js';
import './models/ExamFee.js';
import ExamFee from './models/ExamFee.js';
import Student from './models/Student.js';

dotenv.config();

const testCreate = async () => {
    try {
        await connectDB();
        const student = await Student.findOne({ status: 'Active' });
        if (!student) {
            console.log('No active student found for testing');
            process.exit(0);
        }
        
        const receiptNumber = `TEST-${Date.now().toString().slice(-4)}`;
        const fee = await ExamFee.create({
            studentId: student._id,
            classId: student.classId,
            amount: 1,
            description: 'Test Exam Fee',
            receiptNumber
        });
        console.log('CREATED TEST FEE:', JSON.stringify(fee, null, 2));
        
        // Clean up
        await ExamFee.findByIdAndDelete(fee._id);
        console.log('Deleted test fee');
        
        process.exit(0);
    } catch (err) {
        console.error('ERROR in test script:', err.message);
        process.exit(1);
    }
};
testCreate();
