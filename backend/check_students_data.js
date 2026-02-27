import mongoose from 'mongoose';

const mongoURI = 'mongodb://localhost:27017/alkhid_skill_db';

const checkStudents = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const studentsCollection = db.collection('students');

        const allStudents = await studentsCollection.find({}).toArray();
        console.log(`Found ${allStudents.length} total students.`);

        allStudents.forEach(s => {
            console.log(`- Student ID: ${s._id}, Status: ${s.status}, EnrollmentNo: ${s.enrollmentNo}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking students:', error);
        process.exit(1);
    }
};

checkStudents();
