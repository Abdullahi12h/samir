import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        enrollmentNo: {
            type: String,
            required: true,
            unique: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
        skillId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill',
            required: true,
        },
        registrationFee: {
            type: String, // Dropdown text
        },
        amount: {
            type: Number, // Amount number
        },
        motherName: {
            type: String,
        },
        totalPaid: {
            type: Number,
            default: 0
        },
        dateOfBirth: {
            type: Date,
        },
        photo: {
            type: String,
        },
        age: {
            type: Number,
        },
        plainPassword: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Active', 'Graduated', 'Dropped'],
            default: 'Active'
        },
        isLocked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
