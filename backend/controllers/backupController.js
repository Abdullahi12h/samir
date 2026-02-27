import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';

const execPromise = promisify(exec);

const models = [
    'User', 'Student', 'Teacher', 'Class', 'Batch', 'Subject', 'Skill', 'SkillCategory',
    'Attendance', 'Exam', 'Result', 'Expense', 'Fee', 'SalaryPayment', 'StudentPayment'
];

export const downloadBackup = async (req, res) => {
    try {
        const backupData = {};
        const summary = {};

        for (const modelName of models) {
            try {
                const { default: Model } = await import(`../models/${modelName}.js`);
                const data = await Model.find({});
                backupData[modelName] = data;
                summary[modelName] = data.length;
                console.log(`[Backup] ${modelName}: ${data.length} records exported.`);
            } catch (e) {
                console.warn(`Could not backup model ${modelName}:`, e.message);
                summary[modelName] = 'Error: ' + e.message;
            }
        }

        // Add metadata for transparency
        backupData.metadata = {
            timestamp: new Date().toISOString(),
            totalModels: models.length,
            recordCounts: summary
        };

        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = `alkhid_backup_${Date.now()}.json`;
        const filePath = path.join(backupDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        res.download(filePath, fileName, (err) => {
            if (err) console.error('Error downloading backup:', err);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).json({ message: 'Backup generation failed', error: error.message });
    }
};

export const restoreBackup = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No backup file uploaded' });
        }

        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const backupData = JSON.parse(fileContent);

        // Clear existing data and insert new data
        for (const modelName of Object.keys(backupData)) {
            try {
                const { default: Model } = await import(`../models/${modelName}.js`);
                if (Model) {
                    await Model.deleteMany({}); // Warning: This drops the whole collection
                    if (backupData[modelName] && backupData[modelName].length > 0) {
                        await Model.insertMany(backupData[modelName]);
                    }
                }
            } catch (e) {
                console.warn(`Could not restore model ${modelName}:`, e.message);
            }
        }

        // Clean up uploaded file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.json({ message: 'Database restored successfully from JSON backup' });

    } catch (error) {
        console.error('Restore Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Restore failed', error: error.message });
    }
};

// Helper to safely convert any value to a cell-safe primitive
const serializeValue = (val) => {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val !== 'object') return val;
    // Handle MongoDB ObjectId
    if (val.toHexString) return val.toHexString();
    // Populated Name/Title priority
    if (val.name) return val.name;
    if (val.title) return val.title;
    if (val.user && val.user.name) return val.user.name;
    if (val._id) return val._id.toString();
    if (Array.isArray(val)) {
        return val.map(item => serializeValue(item)).join(', ');
    }
    return JSON.stringify(val);
};

export const exportToExcel = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Al-Khid SMS';
        workbook.created = new Date();

        for (const modelName of models) {
            try {
                const { default: Model } = await import(`../models/${modelName}.js`);

                // Detailed population configuration
                let query = Model.find({}).lean();

                // Apply common populations for readability
                if (modelName === 'Student') query = query.populate('user', 'name');
                if (modelName === 'Exam' || modelName === 'Result') {
                    query = query.populate('skillId', 'name').populate('classId', 'name').populate('subjectId', 'name');
                    if (modelName === 'Result') query = query.populate({ path: 'studentId', populate: { path: 'user', select: 'name' } });
                }
                if (modelName === 'Fee' || modelName === 'StudentPayment') {
                    query = query.populate({ path: 'studentId', populate: { path: 'user', select: 'name' } });
                }
                if (modelName === 'SalaryPayment' || modelName === 'Teacher') {
                    query = query.populate('user', 'name');
                }

                const data = await query.exec();

                if (data.length > 0) {
                    const sheet = workbook.addWorksheet(modelName);
                    const keys = new Set();
                    data.forEach(item => Object.keys(item).forEach(k => {
                        if (k !== '__v' && k !== 'password') keys.add(k);
                    }));

                    sheet.columns = Array.from(keys).map(key => ({
                        header: key.toUpperCase(),
                        key,
                        width: 25
                    }));

                    data.forEach(item => {
                        const rowData = {};
                        for (const key of keys) {
                            rowData[key] = serializeValue(item[key]);
                        }
                        sheet.addRow(rowData);
                    });

                    sheet.getRow(1).font = { bold: true };
                    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                }
            } catch (e) {
                console.warn(`Could not export model ${modelName}:`, e.message);
            }
        }

        const fileName = `alkhid_data_export_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Excel Export Error:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Excel export failed' });
    }
};

/**
 * Full System Backup: Database (JSON) + Uploads Folder
 * Packages everything into a single .zip file using tar
 */

export const downloadFullBackup = async (req, res) => {
    let zipFilePath = '';

    try {
        console.log('[Backup] Starting pure Node full system backup...');

        const backupData = {};
        const summary = {};
        for (const modelName of models) {
            try {
                const modelPath = path.join(process.cwd(), 'models', `${modelName}.js`);
                const { default: Model } = await import(`file://${modelPath}`);
                const data = await Model.find({});
                backupData[modelName] = data;
                summary[modelName] = data.length;
            } catch (e) {
                console.warn(`[Backup] Warning: Could not export ${modelName}:`, e.message);
                summary[modelName] = 'Error';
            }
        }

        backupData.metadata = {
            timestamp: new Date().toISOString(),
            recordCounts: summary,
            system: 'Al-Hafid Skills'
        };

        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const timestamp = Date.now();
        const zipFileName = `alkhid_full_system_${timestamp}.zip`;
        zipFilePath = path.join(backupDir, zipFileName);

        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`[Backup] ZIP created: ${archive.pointer()} total bytes`);
            res.download(zipFilePath, `alkhid_full_backup_${timestamp}.zip`, (err) => {
                setTimeout(() => {
                    if (fs.existsSync(zipFilePath)) {
                        try { fs.unlinkSync(zipFilePath); } catch (e) { }
                    }
                }, 10000); // 10 sec cleanup delay
                if (err && !res.headersSent) console.error('[Backup] Send error:', err);
            });
        });

        archive.on('error', (err) => { throw err; });
        archive.pipe(output);

        // Add JSON
        archive.append(JSON.stringify(backupData, null, 2), { name: `db_data_${timestamp}.json` });

        // Add uploads
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (fs.existsSync(uploadsDir)) {
            archive.directory(uploadsDir, 'uploads');
        }

        await archive.finalize();

    } catch (error) {
        console.error('[Backup] Full Backup Critical Error:', error);
        if (zipFilePath && fs.existsSync(zipFilePath)) {
            try { fs.unlinkSync(zipFilePath); } catch (e) { }
        }
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Full system backup failed',
                error: error.message
            });
        }
    }
};
