import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Result from './models/Result.js';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Skill from './models/Skill.js';
import fs from 'fs';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const results = await Result.find({})
            .populate({
                path: 'studentId',
                populate: { path: 'user', select: 'name' }
            })
            .populate('examId');

        fs.writeFileSync('results_dump.json', JSON.stringify(results, null, 2));
        console.log('Dumped to results_dump.json');

        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR:', error);
    }
};

run();
