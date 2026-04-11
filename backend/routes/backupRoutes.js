import express from 'express';
import multer from 'multer';
import { 
    downloadBackup, 
    restoreBackup, 
    exportToExcel, 
    downloadFullBackup,
    importStudentsFromExcel,
    clearDatabase
} from '../controllers/backupController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Temporarily store in uploads directory
    },
    filename(req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, `import_${Date.now()}.${ext}`);
    }
});
const upload = multer({ storage });

router.get('/download', protect, admin, downloadBackup);
router.get('/export-excel', protect, admin, exportToExcel);
router.get('/full-zip', protect, admin, downloadFullBackup);
router.post('/restore', protect, admin, upload.single('backupFile'), restoreBackup);
router.post('/import-students', protect, admin, upload.single('excelFile'), importStudentsFromExcel);
router.delete('/clear', protect, admin, clearDatabase);

export default router;
