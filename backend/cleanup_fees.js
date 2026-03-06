import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const feeSchema = new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId });
const studentSchema = new mongoose.Schema({});
const Fee = mongoose.model('FeeCleanup', feeSchema, 'fees');
const Student = mongoose.model('StudentCleanup', studentSchema, 'students');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const fees = await Fee.find({});
        console.log(`Checking ${fees.length} fees...`);

        let deletedCount = 0;
        for (const fee of fees) {
            if (!fee.studentId) {
                await Fee.findByIdAndDelete(fee._id);
                deletedCount++;
                continue;
            }
            const exists = await Student.findById(fee.studentId);
            if (!exists) {
                await Fee.findByIdAndDelete(fee._id);
                deletedCount++;
            }
        }

        console.log(`✅ Cleanup finished. Deleted ${deletedCount} broken fee records.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
