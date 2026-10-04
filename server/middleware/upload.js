import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Ensure directories exist
['inventory', 'ro', 'receipts', 'general'].forEach(sub => {
  const p = path.join(BASE_UPLOAD_DIR, sub);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = req.uploadSubfolder || 'general';
    if (req.originalUrl.includes('inventory')) {
      subfolder = 'inventory';
    } else if (req.originalUrl.includes('repair-orders') || req.originalUrl.includes('ro')) {
      subfolder = 'ro';
    } else if (req.originalUrl.includes('finance') || req.originalUrl.includes('receipt')) {
      subfolder = 'receipts';
    }
    const targetDir = path.join(BASE_UPLOAD_DIR, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'application/pdf'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Harap upload gambar (JPG, PNG, WebP) atau PDF.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

export function uploadSingle(subfolder = 'general', fieldName = 'file') {
  return (req, res, next) => {
    req.uploadSubfolder = subfolder;
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: 'Upload Error', message: err.message });
      }
      if (req.file) {
        req.file.relativeUrl = `/uploads/${subfolder}/${req.file.filename}`;
      }
      next();
    });
  };
}

export function uploadMultiple(subfolder = 'general', fieldName = 'photos', maxCount = 5) {
  return (req, res, next) => {
    req.uploadSubfolder = subfolder;
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: 'Upload Error', message: err.message });
      }
      if (req.files) {
        req.files.forEach(f => {
          f.relativeUrl = `/uploads/${subfolder}/${f.filename}`;
        });
      }
      next();
    });
  };
}
