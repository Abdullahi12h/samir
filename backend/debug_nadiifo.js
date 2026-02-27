import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Result from './models/Result.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({ name: /nadiifo/i });
        console.log(`Found ${users.length} users matching 'nadiifo'`);

        for (const user of users) {
            console.log(`\nUSER: _id=${user._id}, name=${user.name}, role=${user.role}`);

            const students = await Student.find({ user: user._id });
            console.log(`STUDENT RECORDS for this user: ${students.length}`);
            for (const s of students) {
                console.log(`  Student _id=${s._id}, Enrollment=${s.enrollmentNo}, Class=${s.classId}`);

                const resultsByStudent = await Result.find({ studentId: s._id });
                console.log(`  RESULTS linked by StudentID (${s._id}): ${resultsByStudent.length}`);
                resultsByStudent.forEach(r => console.log(`    - Result _id=${r._id}, Marks=${r.marksObtained}`));
            }

            const resultsByUser = await Result.find({ studentId: user._id });
            if (resultsByUser.length > 0) {
                console.log(`  RESULTS linked by UserID (${user._id}) directly (WRONG PATTERN): ${resultsByUser.length}`);
                resultsByUser.forEach(r => console.log(`    - Result _id=${r._id}, Marks=${r.marksObtained}`));
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

run();
