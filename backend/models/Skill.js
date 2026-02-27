import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
    },
    { timestamps: true }
);

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
