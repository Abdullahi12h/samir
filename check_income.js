import mongoose from 'mongoose';
import Fee from './backend/models/Fee.js';
import StudentPayment from './backend/models/StudentPayment.js';
import dotenv from 'dotenv';
dotenv.config();

const check = async () => {
    try {
        await mongoose.connect('mongodb+srv://abdullahidacad28_db_user:hIpD9BZs6mXCdsyV@cluster0.hkf4dpj.mongodb.net/Al-hafiids?appName=Cluster0');

        const paidFees = await Fee.find({ status: 'Paid' });
        const feeTotal = paidFees.reduce((acc, f) => acc + (f.amount || 0), 0);
        console.log('Paid Fees count:', paidFees.length);
        console.log('Paid Fees total:', feeTotal);

        const payments = await StudentPayment.find({});
        const paymentTotal = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        console.log('Student Payments count:', payments.length);
        console.log('Student Payments total:', paymentTotal);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
