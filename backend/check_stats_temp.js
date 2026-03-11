import mongoose from 'mongoose';
import Student from './models/Student.js';
import StudentPayment from './models/StudentPayment.js';
import Fee from './models/Fee.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const aggr = await Student.aggregate([{ $group: { _id: '$classId', count: { $sum: 1 } } }]);
    for (let a of aggr) {
        const c = await mongoose.model('Class').findById(a._id);
        console.log(`Class: ${c ? c.name : 'Unknown'} (${a._id}), Students: ${a.count}`);
    }
    process.exit(0);
}
run();
