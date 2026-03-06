import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const students = await mongoose.connection.db.collection('students').find().limit(5).toArray();
    for (const student of students) {
        await mongoose.connection.db.collection('fees').insertOne({
            studentId: student._id,
            amount: 25,
            month: 3,
            year: 2026,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    console.log('Successfully added 5 fee records.');
    process.exit(0);
}
run();
