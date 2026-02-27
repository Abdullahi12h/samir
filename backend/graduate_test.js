import mongoose from 'mongoose';

const mongoURI = 'mongodb://localhost:27017/alkhid_skill_db';

const graduateStudents = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const studentsCollection = db.collection('students');

        // Find some active students
        const activeStudents = await studentsCollection.find({ status: 'Active' }).limit(3).toArray();

        if (activeStudents.length === 0) {
            console.log('No active students found to graduate.');
            process.exit(0);
        }

        const idsToUpdate = activeStudents.map(s => s._id);

        const result = await studentsCollection.updateMany(
            { _id: { $in: idsToUpdate } },
            { $set: { status: 'Graduated' } }
        );

        console.log(`Successfully marked ${result.modifiedCount} students as Graduated.`);
        process.exit(0);
    } catch (error) {
        console.error('Error graduating students:', error);
        process.exit(1);
    }
};

graduateStudents();
