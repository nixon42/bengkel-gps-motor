#!/usr/bin/env node

/**
 * Bengkel Mobil GPS Motor Kediri
 * Offline Image Storage Salt & Restore CLI Utility
 * 
 * Usage:
 *   node scripts/restore-images.js --status
 *   node scripts/restore-images.js --restore
 *   node scripts/restore-images.js --salt
 * 
 * Options:
 *   --salt="custom-password"   Specify password/salt (defaults to env IMAGE_STORAGE_SALT)
 *   --dir="/path/to/uploads"   Specify custom uploads directory
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import salter from '../server/services/imageSalter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags
const args = process.argv.slice(2);
let mode = 'status';
let customSalt = process.env.IMAGE_STORAGE_SALT || 'bengkel-gps-motor-secure-salt-2026';
let targetDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

for (const arg of args) {
  if (arg === '--restore' || arg === '--desalt') {
    mode = 'restore';
  } else if (arg === '--salt') {
    mode = 'salt';
  } else if (arg === '--status') {
    mode = 'status';
  } else if (arg.startsWith('--salt=')) {
    customSalt = arg.split('=')[1];
  } else if (arg.startsWith('--dir=')) {
    targetDir = arg.split('=')[1];
  }
}

targetDir = path.resolve(targetDir);

if (!fs.existsSync(targetDir)) {
  console.error(`[Error] Target upload directory not found: ${targetDir}`);
  process.exit(1);
}

const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (SUPPORTED_EXTS.has(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  }
  return arrayOfFiles;
}

const allImageFiles = getAllFiles(targetDir);

console.log('===============================================================');
console.log('  Bengkel GPS Motor Kediri — Image Storage Utility');
console.log(`  Directory : ${targetDir}`);
console.log(`  Total Files: ${allImageFiles.length} image(s) found`);
console.log(`  Mode      : ${mode.toUpperCase()}`);
console.log('===============================================================');

let saltedCount = 0;
let plainCount = 0;

for (const f of allImageFiles) {
  const buf = fs.readFileSync(f);
  if (salter.isSalted(buf)) {
    saltedCount++;
  } else {
    plainCount++;
  }
}

console.log(`Current Status:`);
console.log(`  - Salted (Obfuscated on disk) : ${saltedCount}`);
console.log(`  - Plain (Directly readable)   : ${plainCount}`);
console.log('---------------------------------------------------------------');

if (mode === 'status') {
  console.log('\nRun with --restore to unscramble all files back to normal images.');
  console.log('Run with --salt to obfuscate all plain images.\n');
  process.exit(0);
}

if (mode === 'restore') {
  console.log(`Unscrambling (Restoring) salted images using salt key...`);
  let restored = 0;
  for (const f of allImageFiles) {
    const success = salter.desaltFile(f, customSalt);
    if (success) {
      restored++;
      const rel = path.relative(targetDir, f);
      console.log(`  ✔ Restored: ${rel}`);
    }
  }
  console.log(`\nSuccessfully restored ${restored} file(s) to plain images.`);
} else if (mode === 'salt') {
  console.log(`Salting (Obfuscating) plain images on disk using salt key...`);
  let salted = 0;
  for (const f of allImageFiles) {
    const success = salter.saltFile(f, customSalt);
    if (success) {
      salted++;
      const rel = path.relative(targetDir, f);
      console.log(`  🔒 Salted: ${rel}`);
    }
  }
  console.log(`\nSuccessfully salted ${salted} file(s) on disk.`);
}

console.log('Done.');
