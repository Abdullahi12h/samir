import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        console.log('Connected to DB');

        const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
            console.log('Users collection found. Dropping email_1 index...');
            try {
                await mongoose.connection.db.collection('users').dropIndex('email_1');
                console.log('Successfully dropped email_1 index.');
            } catch (err) {
                if (err.codeName === 'IndexNotFound' || err.message.includes('index not found')) {
                    console.log('Index email_1 not found, nothing to drop.');
                } else {
                    throw err;
                }
            }
        } else {
            console.log('Users collection not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
fix();
