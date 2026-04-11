import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const testPersist = async () => {
    const localDbPath = path.join(process.cwd(), 'local-db-data');
    if (!fs.existsSync(localDbPath)) {
        fs.mkdirSync(localDbPath, { recursive: true });
    }

    const mongoServer = await MongoMemoryServer.create({
        instance: {
            dbPath: localDbPath,
            storageEngine: 'wiredTiger'
        }
    });

    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', TestSchema);

    // Count existing
    const count = await TestModel.countDocuments();
    console.log(`Initial count: ${count}`);

    // Insert new
    await TestModel.create({ name: 'test' });
    
    // Count after
    const newCount = await TestModel.countDocuments();
    console.log(`Final count: ${newCount}`);

    await mongoose.disconnect();
    await mongoServer.stop({ doCleanup: false });
    process.exit(0);
};

testPersist();
