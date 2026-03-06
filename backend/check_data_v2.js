const mongoose = require('mongoose');
require('dotenv').config();

const feeSchema = new mongoose.Schema({ studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' } }, { strict: false });
const studentSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { strict: false });
const userSchema = new mongoose.Schema({ name: String }, { strict: false });

const Fee = mongoose.model('FeeCheck', feeSchema, 'fees');
const Student = mongoose.model('StudentCheck', studentSchema, 'students');
const User = mongoose.model('UserCheck', userSchema, 'users');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const fees = await Fee.find({});
        console.log(`Total fees: ${fees.length}`);

        for (const f of fees.slice(0, 10)) {
            const student = await Student.findById(f.studentId);
            console.log(`Fee ID: ${f._id}`);
            console.log(`  studentId in Fee: ${f.studentId}`);
            console.log(`  Student exists: ${!!student}`);
            if (student) {
                const user = await User.findById(student.user);
                console.log(`  User exists: ${!!user}`);
                if (user) console.log(`  User name: ${user.name}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
