import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        teacherId: {
            type: String, // Auto-generated ID
            required: true,
            unique: true
        },
        subjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
            },
        ],
        subjectId: { // This seems to be a single subject ID, distinct from the 'subjects' array
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
        },
        salary: {
            type: Number,
            default: 0,
        },
        photo: { type: String },
        cv: { type: String },
        address: { type: String },
        educationLevel: { type: String },
        specialization: { type: String },
        experience: { type: Number },
        gender: { type: String, enum: ['Male', 'Female'] },
        registrationDate: { type: Date, default: Date.now },
        plainPassword: { type: String },
        skills: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        }],
        classIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        }]
    },
    { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
