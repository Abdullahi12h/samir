import mongoose from 'mongoose';

const mongoURI = 'mongodb://localhost:27017/alkhid_skill_db';

const revertStudents = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const studentsCollection = db.collection('students');

        // Mark all 'Graduated' students back to 'Active'
        const result = await studentsCollection.updateMany(
            { status: 'Graduated' },
            { $set: { status: 'Active' } }
        );

        console.log(`Successfully reverted ${result.modifiedCount} students back to Active.`);
        process.exit(0);
    } catch (error) {
        console.error('Error reverting students:', error);
        process.exit(1);
    }
};

revertStudents();
