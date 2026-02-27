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

        const user = await User.findOne({ name: /nafiso/i });
        if (!user) {
            console.log("User 'nafiso' NOT FOUND");
            await mongoose.disconnect();
            return;
        }

        console.log(`USER: _id=${user._id}, name=${user.name}, username=${user.username}, role=${user.role}`);

        const student = await Student.findOne({ user: user._id });
        if (!student) {
            console.log("STUDENT record NOT FOUND for this user");
            await mongoose.disconnect();
            return;
        }

        console.log(`STUDENT: _id=${student._id}, Enrollment=${student.enrollmentNo}, Class=${student.classId}`);

        const results = await Result.find({ studentId: student._id }).populate({
            path: 'examId',
            populate: { path: 'skillId', select: 'name' }
        });

        console.log(`RESULTS found: ${results.length}`);
        results.forEach(r => {
            console.log(`  - Exam: ${r.examId?.type}, Skill: ${r.examId?.skillId?.name}, Marks: ${r.marksObtained}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

run();
