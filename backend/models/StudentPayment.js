import mongoose from 'mongoose';

const studentPaymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
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
    receiptNumber: {
        type: String, // Auto-generated
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('StudentPayment', studentPaymentSchema);
