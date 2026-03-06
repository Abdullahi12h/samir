import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const total = await mongoose.connection.db.collection('students').countDocuments();
    const withAmount = await mongoose.connection.db.collection('students').countDocuments({ amount: { $exists: true, $ne: null } });
    console.log(`Total students: ${total}`);
    console.log(`Students with amount: ${withAmount}`);
    process.exit(0);
}
check();
