import express from 'express';
import multer from 'multer';
import { downloadBackup, restoreBackup, exportToExcel, downloadFullBackup } from '../controllers/backupController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Temporarily store in uploads directory
    },
    filename(req, file, cb) {
        cb(null, `restore_backup_${Date.now()}.json`);
    }
});
const upload = multer({ storage });

router.get('/download', protect, admin, downloadBackup);
router.get('/export-excel', protect, admin, exportToExcel);
router.get('/full-zip', protect, admin, downloadFullBackup);
router.post('/restore', protect, admin, upload.single('backupFile'), restoreBackup);

export default router;
