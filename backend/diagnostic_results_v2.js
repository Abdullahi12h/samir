import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Result from './models/Result.js';
import User from './models/User.js';
import Exam from './models/Exam.js'; // Ensure Exam is registered

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({ name: /nadiifo/i });
        console.log(`Found ${users.length} users matching 'nadiifo'`);

        for (const user of users) {
            console.log(`\nUser: ${user.name} (ID: ${user._id})`);
            const students = await Student.find({ user: user._id });
            console.log(`Found ${students.length} student records for this user`);

            for (const student of students) {
                console.log(`  Student Record ID: ${student._id}, Enrollment: ${student.enrollmentNo}`);
                const results = await Result.find({ studentId: student._id }).populate({ path: 'examId', select: 'type' });
                console.log(`  Found ${results.length} results for this Student ID`);
                results.forEach(r => {
                    console.log(`    - ResultID: ${r._id}, Exam: ${r.examId?.type || 'N/A'}, Marks: ${r.marksObtained}`);
                });

                // Also check if results are linked by USER ID by mistake
                const resultsByUser = await Result.find({ studentId: user._id });
                if (resultsByUser.length > 0) {
                    console.log(`  WARNING: Found ${resultsByUser.length} results linked directly to USER ID instead of Student ID!`);
                }
            }

            // If no student record found, search results by USER ID directly
            if (students.length === 0) {
                const resultsByUserDirect = await Result.find({ studentId: user._id });
                console.log(`  Searching results by User ID directly: Found ${resultsByUserDirect.length} results`);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
