import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    date: { type: Date, required: true },
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
    }]
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
