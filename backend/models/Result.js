import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, // Keep for legacy but optional
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },

    midterm: { type: Number, default: 0, min: 0, max: 40 },
    test: { type: Number, default: 0, min: 0, max: 20 },
    final: { type: Number, default: 0, min: 0, max: 40 },
    total: { type: Number, default: 0 },

    marksObtained: { type: Number }, // Legacy field
    isLocked: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save hook to calculate total
resultSchema.pre('save', function (next) {
    this.total = (this.midterm || 0) + (this.test || 0) + (this.final || 0);
    // Sync with legacy field for compatibility if needed
    if (this.total > 0) this.marksObtained = this.total;
    next();
});

export default mongoose.model('Result', resultSchema);
