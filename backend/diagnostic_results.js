import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Result from './models/Result.js';
import User from './models/User.js';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI ? 'FOUND' : 'NOT FOUND');

const run = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await Student.find({}).populate('user', 'name username');
        const results = await Result.find({});

        console.log('\n--- Students ---');
        console.log(`Found ${students.length} students`);
        students.forEach(s => {
            console.log(`StudentDocID: ${s._id}, UserDocID: ${s.user?._id}, Name: ${s.user?.name}, Enrollment: ${s.enrollmentNo}`);
        });

        console.log('\n--- Results ---');
        console.log(`Found ${results.length} results`);
        results.forEach(r => {
            console.log(`ResultID: ${r._id}, StudentRefID: ${r.studentId}, Marks: ${r.marksObtained}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
};

run();
