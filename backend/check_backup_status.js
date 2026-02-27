import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const modelsList = [
    'User', 'Student', 'Teacher', 'Class', 'Batch', 'Subject', 'Skill', 'SkillCategory',
    'Attendance', 'Exam', 'Result', 'Expense', 'Fee', 'SalaryPayment', 'StudentPayment'
];

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        console.log('Connected to MongoDB');

        for (const modelName of modelsList) {
            try {
                const modelPath = path.resolve('models', `${modelName}.js`);
                // Use dynamic import for ES modules
                const { default: Model } = await import('file://' + modelPath);
                if (!Model) {
                    console.log(`${modelName}: FAIL - No default export found`);
                    continue;
                }
                const count = await Model.countDocuments();
                console.log(`${modelName}: ${count} records`);
            } catch (err) {
                console.error(`${modelName}: ERROR - ${err.message}`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Connection Error:', err);
    }
}

checkData();
