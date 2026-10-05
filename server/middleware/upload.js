import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { saltFile } from '../services/imageSalter.js';

// VPS Kentang (2 Core, 2GB RAM) resource guarding for libvips:
// Limit concurrency to 1 thread and libvips memory cache to 32MB to prevent OOM
sharp.concurrency(1);
sharp.cache({ memory: 32, files: 20, items: 100 });

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
    fileSize: 15 * 1024 * 1024 // 15MB limit before compression
  },
  fileFilter
});

/**
 * Optimizes an uploaded image file:
 * - Resizes to max 1280px (bounding box) without enlargement
 * - Auto-orients based on EXIF and strips metadata for privacy
 * - Compresses with target ~100KB (2-pass adaptive compression)
 * - Safely skips non-images (e.g. PDFs) or unparseable buffers (unit test mocks)
 */
export async function optimizeUploadedImage(filePath, mimeType, targetBytes = 100 * 1024) {
  if (!filePath || !fs.existsSync(filePath)) return;
  if (!mimeType || !mimeType.startsWith('image/')) return;

  try {
    const ext = path.extname(filePath).toLowerCase();

    // First pass: 1280px max dimension, quality 80
    let pipeline = sharp(filePath)
      .rotate()
      .resize({
        width: 1280,
        height: 1280,
        fit: 'inside',
        withoutEnlargement: true
      });

    if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, quality: 80 });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 80, effort: 4 });
    } else {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    }

    let buffer = await pipeline.toBuffer();

    // Second pass if still larger than target (100KB)
    if (buffer.length > targetBytes) {
      let secondPass = sharp(buffer)
        .resize({
          width: 1024,
          height: 1024,
          fit: 'inside',
          withoutEnlargement: true
        });

      if (ext === '.png') {
        secondPass = secondPass.png({ compressionLevel: 9, quality: 65, palette: true });
      } else if (ext === '.webp') {
        secondPass = secondPass.webp({ quality: 70, effort: 5 });
      } else {
        secondPass = secondPass.jpeg({ quality: 70, mozjpeg: true });
      }

      const secondBuffer = await secondPass.toBuffer();
      if (secondBuffer.length < buffer.length) {
        buffer = secondBuffer;
      }
    }

    // Save optimized buffer back to file
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    // If not a parseable image (e.g. mock test buffers), silently preserve original file
  }
}

export function uploadSingle(subfolder = 'general', fieldName = 'file') {
  return (req, res, next) => {
    req.uploadSubfolder = subfolder;
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Upload Error', message: err.message });
      }
      if (req.file) {
        await optimizeUploadedImage(req.file.path, req.file.mimetype);
        if (req.file.mimetype && req.file.mimetype.startsWith('image/')) {
          saltFile(req.file.path);
        }
        req.file.relativeUrl = `/uploads/${subfolder}/${req.file.filename}`;
      }
      next();
    });
  };
}

export function uploadMultiple(subfolder = 'general', fieldName = 'photos', maxCount = 5) {
  return (req, res, next) => {
    req.uploadSubfolder = subfolder;
    upload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Upload Error', message: err.message });
      }
      if (req.files && req.files.length > 0) {
        await Promise.all(
          req.files.map(async (f) => {
            await optimizeUploadedImage(f.path, f.mimetype);
            if (f.mimetype && f.mimetype.startsWith('image/')) {
              saltFile(f.path);
            }
            f.relativeUrl = `/uploads/${subfolder}/${f.filename}`;
          })
        );
      }
      next();
    });
  };
}
