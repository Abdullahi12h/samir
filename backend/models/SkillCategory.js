import mongoose from 'mongoose';

const skillCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
    },
    { timestamps: true }
);

const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);
export default SkillCategory;
