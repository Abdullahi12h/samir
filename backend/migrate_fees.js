import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fee from './models/Fee.js';

dotenv.config();

async function migrateFees() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const fees = await Fee.find({ month: { $exists: false } });
    console.log(`Migrating ${fees.length} fees...`);

    for (const fee of fees) {
        const date = fee.createdAt || new Date();
        fee.month = date.getMonth() + 1;
        fee.year = date.getFullYear();
        await fee.save();
    }

    console.log('Migration complete');
    process.exit();
}
migrateFees();
