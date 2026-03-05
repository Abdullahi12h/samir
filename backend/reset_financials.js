import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fee from './models/Fee.js';
import StudentPayment from './models/StudentPayment.js';
import Student from './models/Student.js';
import Expense from './models/Expense.js';

dotenv.config();

const resetFinancials = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // 1. Reset all Fees to Pending
        const feeResult = await Fee.updateMany({}, { status: 'Pending' });
        console.log(`Updated ${feeResult.modifiedCount} fees to Pending`);

        // 2. Delete all Student Payments
        const paymentResult = await StudentPayment.deleteMany({});
        console.log(`Deleted ${paymentResult.deletedCount} payment records`);

        // 3. Reset Student totalPaid balances
        const studentResult = await Student.updateMany({}, { totalPaid: 0 });
        console.log(`Reset totalPaid for ${studentResult.modifiedCount} students`);

        // 4. Reset Expenses (Optional but good for fresh start)
        const expenseResult = await Expense.deleteMany({});
        console.log(`Deleted ${expenseResult.deletedCount} expense records`);

        console.log('Financial data has been successfully reset to $0.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting data:', error);
        process.exit(1);
    }
};

resetFinancials();
