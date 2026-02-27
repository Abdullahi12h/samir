import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images and Documents only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', upload.single('file'), (req, res) => {
    console.log('[upload] File received:', req.file ? req.file.path : 'None');
    if (!req.file) {
        console.error('[upload] No file in request');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.send({
        message: 'File Uploaded',
        file: `/${req.file.path.replace(/\\/g, '/')}`,
    });
}, (error, req, res, next) => {
    console.error('[upload] Multer error:', error);
    res.status(400).json({ message: error.message || error });
});

export default router;
