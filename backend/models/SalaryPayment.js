import mongoose from 'mongoose';

const salaryPaymentSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    period: {
        type: String, // e.g., 'March 2026'
        required: true
    },
    status: {
        type: String,
        enum: ['Paid'], // Since this model is for payments, if a record exists, it usually implies paid. Or we keep it for report views.
        default: 'Paid'
    }
}, { timestamps: true });

export default mongoose.model('SalaryPayment', salaryPaymentSchema);
