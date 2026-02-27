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
        console.log(`Found ${users.length} users with name including 'nadiifo'`);

        for (const user of users) {
            console.log(`\nUser Profile:`);
            console.log(`  _id: ${user._id}`);
            console.log(`  name: ${user.name}`);
            console.log(`  username: ${user.username}`);
            console.log(`  role: ${user.role}`);

            const student = await Student.findOne({ user: user._id });
            if (student) {
                console.log(`  Linked Student Doc ID: ${student._id}`);
                console.log(`  Enrollment: ${student.enrollmentNo}`);

                const results = await Result.find({ studentId: student._id });
                console.log(`  Results found for this Student ID: ${results.length}`);
            } else {
                console.log(`  No Student Document linked to this user.`);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

run();
