import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const studentSchema = new mongoose.Schema({
    enrollmentNo: String
}, { strict: false });

const Student = mongoose.model('StudentTempUpdate', studentSchema, 'students');

async function updateEnrollmentNumbers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await Student.find({}).sort({ createdAt: 1 });

        console.log(`Waxaan helay ${students.length} arday. Waan bilaabayaa bedelidda...`);

        let count = 1;
        for (const student of students) {
            const newNo = `STU-${count.toString().padStart(4, '0')}`;
            student.enrollmentNo = newNo;
            await student.save();
            console.log(`Updated ID: ${newNo}`);
            count++;
        }

        console.log('\n✅ Dhammaan Ardaydii hore IDs-koodii waa la beddelay! (STU-0001, STU-0002, iwm)');
        process.exit(0);
    } catch (err) {
        console.error("Error ayaa dhacay:", err);
        process.exit(1);
    }
}

updateEnrollmentNumbers();
