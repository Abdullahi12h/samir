import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('OK');
        const count = await mongoose.connection.db.collection('results').countDocuments();
        console.log('Results count:', count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
