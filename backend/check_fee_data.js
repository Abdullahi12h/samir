import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fee from './models/Fee.js';
import StudentPayment from './models/StudentPayment.js';

dotenv.config();

async function checkData() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const fee = await Fee.findOne().sort({ createdAt: -1 });
    console.log('Latest Fee:', fee ? { id: fee._id, studentId: fee.studentId, createdAt: fee.createdAt } : 'None');

    const payment = await StudentPayment.findOne().sort({ paymentDate: -1 });
    console.log('Latest Payment:', payment ? { id: payment._id, studentId: payment.studentId, paymentDate: payment.paymentDate } : 'None');

    process.exit();
}
checkData();
