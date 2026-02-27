import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Result from './models/Result.js';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Skill from './models/Skill.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');

        const results = await Result.find({})
            .populate({
                path: 'studentId',
                populate: { path: 'user', select: 'name' }
            })
            .populate('examId');

        console.log(`\nTOTAL RESULTS: ${results.length}`);
        results.forEach((r, i) => {
            console.log(`${i + 1}. ResultID: ${r._id}`);
            console.log(`   Student: ${r.studentId?.user?.name || 'N/A'} (SID: ${r.studentId?._id || 'N/A'})`);
            console.log(`   Exam: ${r.examId?.type || 'N/A'}`);
            console.log(`   Marks: ${r.marksObtained}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR:', error);
    }
};

run();
