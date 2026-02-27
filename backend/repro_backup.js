import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();
const execPromise = promisify(exec);

const models = [
    'User', 'Student', 'Teacher', 'Class', 'Batch', 'Subject', 'Skill', 'SkillCategory',
    'Attendance', 'Exam', 'Result', 'Expense', 'Fee', 'SalaryPayment', 'StudentPayment'
];

async function testFullBackupLogic() {
    let jsonFilePath = '';
    let zipFilePath = '';

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alkhid_skill_db');
        console.log('Connected to DB');

        const backupData = {};
        const summary = {};
        for (const modelName of models) {
            try {
                const { default: Model } = await import(`./models/${modelName}.js`);
                const data = await Model.find({});
                backupData[modelName] = data;
                summary[modelName] = data.length;
                console.log(`[Backup] ${modelName}: ${data.length}`);
            } catch (e) {
                console.error(`Error with ${modelName}:`, e.message);
                summary[modelName] = 'Error';
            }
        }

        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const timestamp = Date.now();
        jsonFilePath = path.join(backupDir, `test_db_data_${timestamp}.json`);
        zipFilePath = path.join(backupDir, `test_alkhid_full_${timestamp}.zip`);

        fs.writeFileSync(jsonFilePath, JSON.stringify(backupData, null, 2));
        console.log('JSON written to:', jsonFilePath);

        const uploadsDir = path.join(process.cwd(), 'uploads');
        const cmd = `tar -acvf "${zipFilePath}" -C "${process.cwd()}" "uploads" -C "${backupDir}" "${path.basename(jsonFilePath)}"`;

        console.log('Running command:', cmd);
        const { stdout, stderr } = await execPromise(cmd);
        console.log('STDOUT:', stdout);
        console.log('STDERR:', stderr);

        if (fs.existsSync(zipFilePath)) {
            console.log('Success! Zip created at:', zipFilePath);
        } else {
            console.log('Failed to create zip');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Logic Test Error:', err);
    }
}

testFullBackupLogic();
