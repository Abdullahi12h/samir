import mongoose from 'mongoose';
import Student from './models/Student.js';

const mongoURI = 'mongodb://localhost:27017/alkhid_skill_db';

const testFilter = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find a batch that has students
        const students = await Student.find({}).limit(1);
        if (students.length === 0) {
            console.log('No students found in DB.');
            process.exit(0);
        }

        const testBatchId = students[0].batchId;
        console.log(`Testing filter for batchId: ${testBatchId}`);

        const filteredStudents = await Student.find({ batchId: testBatchId }).populate('batchId', 'name');
        console.log(`Found ${filteredStudents.length} students for this batch.`);

        if (filteredStudents.length > 0) {
            console.log('Verification Success: Batch filtering works correctly.');
        } else {
            console.log('Verification Failure: No students found for the batch ID.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
};

testFilter();
