import mongoose from 'mongoose';
import User from './models/User.js';
import Student from './models/Student.js';

const mongoURI = 'mongodb://localhost:27017/alkhid_skill_db';

const seedGraduates = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const batchId = '699d93e87eee030369a8919c';
        const classId = '699f4664e5aef9ba6401e685';
        const skillId = '699d93627eee030369a89152';

        const graduates = [
            { name: 'Nasteexo Cali', username: 'nasteexo1', phone: '252615111111', whatsapp: '252615111111', enrollmentNo: 'EN-1001', registrationFee: 'Paid', amount: 50, motherName: 'Faadumo', age: 20 },
            { name: 'Xaawo Maxamed', username: 'xaawo2', phone: '252615222222', whatsapp: '252615222222', enrollmentNo: 'EN-1002', registrationFee: 'Paid', amount: 45, motherName: 'Safiyo', age: 22 },
            { name: 'Deeqa Axmed', username: 'deeqa3', phone: '252615333333', whatsapp: '252615333333', enrollmentNo: 'EN-1003', registrationFee: 'Paid', amount: 60, motherName: 'Xaliimo', age: 21 },
            { name: 'Nimco Jaamac', username: 'nimco4', phone: '252615444444', whatsapp: '252615444444', enrollmentNo: 'EN-1004', registrationFee: 'Paid', amount: 55, motherName: 'Layla', age: 19 },
            { name: 'Hibaaq Ciise', username: 'hibaaq5', phone: '252615555555', whatsapp: '252615555555', enrollmentNo: 'EN-1005', registrationFee: 'Paid', amount: 50, motherName: 'Maryan', age: 23 }
        ];

        for (const data of graduates) {
            // Check if user exists
            let user = await User.findOne({ username: data.username });
            if (!user) {
                user = await User.create({
                    name: data.name,
                    username: data.username,
                    password: 'password123',
                    role: 'Student',
                    phone: data.phone,
                    whatsapp: data.whatsapp
                });
            }

            // Check if student exists
            let student = await Student.findOne({ enrollmentNo: data.enrollmentNo });
            if (!student) {
                await Student.create({
                    user: user._id,
                    enrollmentNo: data.enrollmentNo,
                    classId,
                    batchId,
                    skillId,
                    registrationFee: data.registrationFee,
                    amount: data.amount,
                    motherName: data.motherName,
                    age: data.age,
                    status: 'Graduated',
                    dateOfBirth: new Date(Date.now() - (data.age * 365 * 24 * 60 * 60 * 1000))
                });
                console.log(`Created student: ${data.name}`);
            } else {
                student.status = 'Graduated';
                await student.save();
                console.log(`Updated student status to Graduated: ${data.name}`);
            }
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedGraduates();
