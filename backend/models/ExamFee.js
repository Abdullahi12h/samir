import mongoose from 'mongoose';

const examFeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    receiptNumber: { type: String },
    description: { type: String, default: 'Exam Fee' }
}, { timestamps: true });

export default mongoose.model('ExamFee', examFeeSchema);
