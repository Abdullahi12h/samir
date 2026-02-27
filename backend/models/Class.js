import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        skillId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill',
            required: true,
        },
    },
    { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);
export default Class;
