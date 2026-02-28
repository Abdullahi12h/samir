import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fee from './models/Fee.js';

dotenv.config();

async function checkFees() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const allFees = await Fee.find({});
    console.log(`Total Fees in DB: ${allFees.length}`);

    allFees.forEach(f => {
        console.log(`ID: ${f._id}, Month: ${f.month}, Year: ${f.year}, Status: ${f.status}`);
    });

    const month8 = await Fee.find({ month: 8 });
    console.log(`Fees with month: 8 count: ${month8.length}`);

    process.exit();
}
checkFees();
