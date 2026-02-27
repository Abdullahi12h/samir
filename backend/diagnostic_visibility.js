import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Skill from './models/Skill.js';
import Class from './models/Class.js';
import Subject from './models/Subject.js';
import Exam from './models/Exam.js';
import Result from './models/Result.js';
import Student from './models/Student.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const student = await Student.findOne({ enrollmentNo: 'EN-626041' }).populate('user');
        if (!student) {
            console.log('Student EN-626041 not found');
            process.exit(1);
        }

        console.log('\n--- ALL SUBJECTS ---');
        const allSubjects = await Subject.find().populate('classId');
        allSubjects.forEach(s => {
            console.log(`Subject: ${s.name} | Class: ${s.classId?.name} | ID: ${s._id}`);
        });

        console.log('\n--- ALL EXAMS ---');
        const allExams = await Exam.find().populate('subjectId classId');
        allExams.forEach(e => {
            console.log(`Exam: ${e.subjectId?.name} | Class: ${e.classId?.name} | Status: ${e.status} | ID: ${e._id}`);
        });

        console.log('\n--- RESULTS FOR EN-626041 ---');
        const studentResults = await Result.find({ studentId: student._id }).populate('subjectId classId');
        studentResults.forEach(r => {
            console.log(`Result: ${r.subjectId?.name} | MID: ${r.midterm} | TEST: ${r.test} | FINAL: ${r.final}`);
            console.log(`       SubjectID: ${r.subjectId?._id}, ClassID: ${r.classId?._id}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
