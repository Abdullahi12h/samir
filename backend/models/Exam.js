import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({

    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['Monthly Exam', 'Final Exam', 'Test', 'Midterm'], required: true, default: 'Monthly Exam' },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
