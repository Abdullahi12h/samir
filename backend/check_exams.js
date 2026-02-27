import mongoose from 'mongoose';
import './models/Exam.js';
import './models/Subject.js';
import './models/Class.js';
import './models/Skill.js';

const Exam = mongoose.model('Exam');

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/alkhid_skill_db');
        const exams = await Exam.find({}).populate('subjectId classId');
        console.log('--- EXAMS IN DB ---');
        exams.forEach(e => {
            console.log(`ID: ${e._id}, Type: ${e.type}, Class: ${e.classId?.name}, Subject: ${e.subjectId?.name || 'NULL'}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
