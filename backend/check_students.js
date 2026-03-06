import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const students = await mongoose.connection.db.collection('students').find().toArray();
    console.log(`Checking ${students.length} students...`);
    for (const s of students) {
        const user = await mongoose.connection.db.collection('users').findOne({ _id: s.user });
        console.log(`Student ID: ${s._id}, EnrollmentNo: ${s.enrollmentNo}, User Found: ${!!user}`);
        if (user) console.log(`  User Name: ${user.name}`);
    }
    process.exit(0);
}
check();
