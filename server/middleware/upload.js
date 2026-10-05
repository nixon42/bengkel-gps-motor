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
    const mime = (file.mimetype || '').toLowerCase();
    const allowedExts = ALLOWED_MIME_EXTENSIONS[mime] || ['.jpg'];
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowedExts.includes(ext)) {
      ext = SAFE_EXTENSION_DEFAULT[mime] || '.jpg';
    }
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const ALLOWED_MIME_EXTENSIONS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf']
};

const SAFE_EXTENSION_DEFAULT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};

const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const allowedExts = ALLOWED_MIME_EXTENSIONS[mime];

  if (!allowedExts) {
    return cb(new Error('Tipe file tidak didukung. Harap upload gambar (JPG, PNG, WebP) atau PDF.'));
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ext && !allowedExts.includes(ext)) {
    return cb(new Error(`Ekstensi file "${ext}" tidak diizinkan untuk tipe konten ${mime}. Harap unggah format gambar (JPG, PNG, WebP) atau PDF yang sesuai.`));
  }

  cb(null, true);
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
