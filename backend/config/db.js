import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
    try {
        console.log(`[DB] Attempting to connect to MongoDB Atlas...`);
        // Try original DB with a short timeout
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        console.log(`[DB] MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[DB] Atlas connection failed (${error.message}). Falling back to Local Memory DB...`);
        try {
            const mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            
            const conn = await mongoose.connect(uri);
            console.log(`[DB] Fallback Local MongoDB Connected: ${conn.connection.host}`);
            console.log(`[DB] WARNING: Data will be lost when the server restarts.`);
        } catch (memError) {
             console.error(`Local Memory DB Error: ${memError.message}`);
             process.exit(1);
        }
    }
};

export default connectDB;
