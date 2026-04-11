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
    'Attendance', 'Exam', 'Result', 'Expense', 'Fee', 'SalaryPayment', 'StudentPayment',
    'Assignment', 'Debt', 'ExamFee', 'Message', 'Order'
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
        const results = [];
        const modelFiles = fs.readdirSync(path.join(process.cwd(), 'models'))
            .filter(f => f.endsWith('.js'))
            .map(f => f.replace('.js', ''));

        for (const rawKey of Object.keys(backupData)) {
            // Skip non-model keys
            if (rawKey === 'metadata' || rawKey === '__v') continue;

            // Try to find matching model file (case insensitive, singular/plural)
            const modelName = modelFiles.find(mf => 
                mf.toLowerCase() === rawKey.toLowerCase() ||
                mf.toLowerCase() === rawKey.toLowerCase().replace(/s$/, '') || // students -> Student
                mf.toLowerCase().replace(/s$/, '') === rawKey.toLowerCase() ||
                (rawKey.toLowerCase() === 'categories' && mf === 'SkillCategory') // handle special cases
            );
            
            if (!modelName) {
                console.log(`[Restore] Skipping ${rawKey}: No matching model found in system.`);
                continue;
            }

            try {
                const modelPath = path.join(process.cwd(), 'models', `${modelName}.js`);
                const { default: Model } = await import(`file://${modelPath}`);
                
                if (Model) {
                    await Model.deleteMany({}); 
                    if (backupData[rawKey] && backupData[rawKey].length > 0) {
                        // Normalize data before raw insertion
                        const normalizedData = backupData[rawKey].map(item => {
                            const newItem = { ...item };
                            
                            // Convert string IDs back to ObjectIds for the raw driver
                            if (newItem._id && typeof newItem._id === 'string') {
                                newItem._id = new mongoose.Types.ObjectId(newItem._id);
                            }
                            
                            // Fix common relational field IDs
                            ['user', 'studentId', 'teacherId', 'classId', 'batchId', 'subjectId', 'skillId'].forEach(field => {
                                if (newItem[field] && typeof newItem[field] === 'string' && newItem[field].length === 24) {
                                    newItem[field] = new mongoose.Types.ObjectId(newItem[field]);
                                }
                            });

                            // Normalize Roles (e.g. 'teacher' -> 'Teacher')
                            if (modelName === 'User' && newItem.role) {
                                const roleMap = {
                                    'admin': 'Admin',
                                    'teacher': 'Teacher',
                                    'student': 'Student'
                                };
                                const lowerRole = newItem.role.toLowerCase();
                                if (roleMap[lowerRole]) {
                                    newItem.role = roleMap[lowerRole];
                                }
                            }

                            return newItem;
                        });

                        // Use raw collection insertion to bypass Mongoose validation
                        await Model.collection.insertMany(normalizedData);
                        
                        console.log(`[Restore] ${modelName}: Restored ${normalizedData.length} records successfully.`);
                        results.push(`${modelName}: ${normalizedData.length}`);
                    }
                }
            } catch (e) {
                console.error(`[Restore] Critical Error in ${modelName}:`, e.message);
            }
        }

        // Clean up uploaded file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.json({ 
            message: 'Database restored successfully!', 
            details: results.join(', ') 
        });

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

export const importStudentsFromExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No Excel file uploaded' });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        
        // Find Student worksheet (either index 1 or named Student/Students)
        let worksheet = workbook.getWorksheet('Student') || workbook.getWorksheet('Students') || workbook.getWorksheet(1);
        
        if (!worksheet) return res.status(400).json({ message: 'No student data found in Excel.' });

        const studentsCreated = [];
        const errors = [];

        const { default: Class } = await import('../models/Class.js');
        const { default: Batch } = await import('../models/Batch.js');
        const { default: Skill } = await import('../models/Skill.js');
        const { default: User } = await import('../models/User.js');
        const { default: Student } = await import('../models/Student.js');

        const classes = await Class.find({});
        const batches = await Batch.find({});
        const skills = await Skill.find({});

        // Map headers to column indices
        const headerRow = worksheet.getRow(1);
        const colMap = {};
        headerRow.eachCell((cell, colNumber) => {
            const h = cell.text?.toUpperCase().trim();
            colMap[h] = colNumber;
        });

        const getVal = (row, header) => {
            const idx = colMap[header];
            if (!idx) return null;
            const cell = row.getCell(idx);
            // Handle ExcelJS cell value types
            if (cell.value && typeof cell.value === 'object') {
                if (cell.value.text) return cell.value.text;
                if (cell.value.richText) return cell.value.richText.map(t => t.text).join(' ');
            }
            return cell.text?.trim() || null;
        };

        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) rows.push(row);
        });

        for (const row of rows) {
            // Support multiple header names for flexibility
            const name = getVal(row, 'NAME') || getVal(row, 'FULL NAME') || getVal(row, 'USER');
            const username = getVal(row, 'USERNAME') || getVal(row, 'ENROLLMENTNO') || (name ? name.toLowerCase().replace(/\s/g, '') : null);
            const password = getVal(row, 'PASSWORD') || getVal(row, 'PLAINPASSWORD') || '123456';
            const phone = getVal(row, 'PHONE') || getVal(row, 'TELEPHONE');
            const className = getVal(row, 'CLASS') || getVal(row, 'CLASSNAME') || getVal(row, 'CLASSID');
            const batchName = getVal(row, 'BATCH') || getVal(row, 'BATCHNAME') || getVal(row, 'BATCHID');
            const skillName = getVal(row, 'SKILL') || getVal(row, 'SKILLNAME') || getVal(row, 'SKILLID');
            const motherName = getVal(row, 'MOTHER NAME') || getVal(row, 'MOTHERNAME');

            if (!name || !username) continue;

            try {
                // Find or Create Class
                let classObj = classes.find(c => 
                    c.name.toLowerCase() === className?.toLowerCase() || 
                    c._id.toString() === className
                );
                if (!classObj && className && className.length < 20) { // Don't create if it looks like an ID
                    classObj = await Class.create({ name: className });
                    classes.push(classObj);
                }

                // Find or Create Batch
                let batchObj = batches.find(b => 
                    b.name.toLowerCase() === batchName?.toLowerCase() || 
                    b._id.toString() === batchName
                );
                if (!batchObj && batchName && batchName.length < 20) {
                    batchObj = await Batch.create({ name: batchName });
                    batches.push(batchObj);
                }

                // Find or Create Skill
                let skillObj = skills.find(s => 
                    s.name.toLowerCase() === skillName?.toLowerCase() || 
                    s._id.toString() === skillName
                );
                if (!skillObj && skillName && skillName.length < 20) {
                    const { default: SkillCategory } = await import('../models/SkillCategory.js');
                    let cat = await SkillCategory.findOne({ name: 'General' });
                    if (!cat) cat = await SkillCategory.create({ name: 'General' });
                    skillObj = await Skill.create({ name: skillName, categoryId: cat._id });
                    skills.push(skillObj);
                }

                if (!classObj || !batchObj || !skillObj) {
                    errors.push(`Row ${row.number}: Missing Class/Batch/Skill`);
                    continue;
                }

                // User logic
                let user = await User.findOne({ username });
                if (!user) {
                    user = await User.create({ name, username, password, role: 'Student', phone });
                }

                // Student record
                const studentExists = await Student.findOne({ user: user._id });
                if (!studentExists) {
                    await Student.create({
                        user: user._id,
                        enrollmentNo: getVal(row, 'ENROLLMENTNO') || `EN-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*100)}`,
                        classId: classObj._id,
                        batchId: batchObj._id,
                        skillId: skillObj._id,
                        motherName,
                        plainPassword: password,
                        amount: Number(getVal(row, 'AMOUNT')) || 0
                    });
                    studentsCreated.push(name);
                }
            } catch (err) {
                errors.push(`Row ${row.number}: ${err.message}`);
            }
        }

        if (fs.existsSync(req.file.path)) try { fs.unlinkSync(req.file.path); } catch(e){}

        res.json({
            message: `Import completed! Created ${studentsCreated.length} students.`,
            errors: errors.length > 0 ? errors : null
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ message: 'Import failed', error: error.message });
    }
};

export const clearDatabase = async (req, res) => {
    try {
        const results = [];
        for (const modelName of models) {
            try {
                const modelPath = path.join(process.cwd(), 'models', `${modelName}.js`);
                if (!fs.existsSync(modelPath)) continue;

                const { default: Model } = await import(`file://${modelPath}`);
                if (Model) {
                    // Don't delete the current admin user to prevent lockout
                    if (modelName === 'User') {
                        await Model.deleteMany({ _id: { $ne: req.user._id } });
                        results.push(`User (except current admin)`);
                    } else {
                        await Model.deleteMany({});
                        results.push(modelName);
                    }
                }
            } catch (e) {
                console.warn(`[Clear] Error clearing ${modelName}:`, e.message);
            }
        }

        res.json({ message: 'System reset successful. All data cleared.', cleared: results });
    } catch (error) {
        console.error('Clear DB Error:', error);
        res.status(500).json({ message: 'System reset failed', error: error.message });
    }
};
