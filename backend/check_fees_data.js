import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const feeSchema = new mongoose.Schema({ studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' } }, { strict: false });
const studentSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { strict: false });
const userSchema = new mongoose.Schema({ name: String }, { strict: false });

const Fee = mongoose.model('FeeCheck', feeSchema, 'fees');
const Student = mongoose.model('StudentCheck', studentSchema, 'students');
const User = mongoose.model('UserCheck', userSchema, 'users');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const fees = await Fee.find({}).limit(5).populate({
            path: 'studentId',
            populate: { path: 'user' }
        });

        console.log("FEES DATA SAMPLE:");
        fees.forEach(f => {
            console.log(`ID: ${f._id}, StudentId: ${f.studentId ? "POPULATED" : "NULL"}, StudentObj: ${JSON.stringify(f.studentId)}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
