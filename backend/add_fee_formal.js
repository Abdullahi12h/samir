import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fee from './models/Fee.js';
import Student from './models/Student.js';

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const student = await Student.findOne();
    if (!student) {
        console.log('No students found');
        process.exit(1);
    }
    const admin = await mongoose.connection.db.collection('users').findOne({ role: 'Admin' });

    const newFee = await Fee.create({
        studentId: student._id,
        user: admin._id,
        amount: 35,
        month: 3,
        year: 2026,
        status: 'Pending'
    });
    console.log('Fee created with Mongoose model:', newFee._id);
    process.exit(0);
}
run();
