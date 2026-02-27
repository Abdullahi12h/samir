import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function findPlainPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        const { default: User } = await import('file://' + path.resolve('models/User.js'));
        const { default: Teacher } = await import('file://' + path.resolve('models/Teacher.js'));

        const admins = await User.find({ role: 'Admin' }).lean();
        console.log('Admins:', admins.map(a => a.username));

        // Check teachers for plainPassword
        const teachers = await Teacher.find({}).populate('user').limit(5).lean();
        teachers.forEach(t => {
            console.log(`Teacher ${t.user?.username}: ${t.plainPassword}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

findPlainPassword();
