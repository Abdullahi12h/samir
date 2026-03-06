import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const feeSchema = new mongoose.Schema({
    studentId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    month: Number,
    year: Number,
    status: String
}, { timestamps: true });

const Fee = mongoose.model('FeeAdmin', feeSchema, 'fees');

async function addTestFee() {
    await mongoose.connect(process.env.MONGO_URI);
    const newFee = await Fee.create({
        studentId: new mongoose.Types.ObjectId("69aa5f8ed9c7b7571c7e9db8"),
        amount: 30,
        month: 3,
        year: 2026,
        status: "Pending"
    });
    console.log('Fee created:', newFee._id);
    process.exit(0);
}
addTestFee();
