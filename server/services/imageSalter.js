import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * 8-byte signature prefix indicating that the file is salted on disk.
 * 'SALTED\x01\x00' -> 0x53 0x41 0x4C 0x54 0x45 0x44 0x01 0x00
 */
export const MAGIC_PREFIX = Buffer.from([0x53, 0x41, 0x4C, 0x54, 0x45, 0x44, 0x01, 0x00]);

/**
 * Cache derived 32-byte keys for performance
 */
const keyCache = new Map();

export function deriveKey(salt) {
  const saltStr = String(salt || process.env.IMAGE_STORAGE_SALT || 'bengkel-gps-motor-secure-salt-2026');
  if (keyCache.has(saltStr)) {
    return keyCache.get(saltStr);
  }
  const key = crypto.createHash('sha256').update(saltStr).digest();
  keyCache.set(saltStr, key);
  return key;
}

/**
 * Check if a buffer starts with the SALTED\x01 magic prefix
 */
export function isSalted(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < MAGIC_PREFIX.length) {
    return false;
  }
  return buffer.subarray(0, MAGIC_PREFIX.length).equals(MAGIC_PREFIX);
}

/**
 * Fast byte-by-byte XOR transformation
 */
function applyXor(payload, key) {
  const len = payload.length;
  const keyLen = key.length;
  const result = Buffer.allocUnsafe(len);
  
  for (let i = 0; i < len; i++) {
    result[i] = payload[i] ^ key[i % keyLen];
  }
  return result;
}

/**
 * Salt / Obfuscate an image buffer with XOR cipher and prefix
 */
export function saltBuffer(buffer, salt) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    return buffer;
  }
  // Prevent double-salting
  if (isSalted(buffer)) {
    return buffer;
  }

  const saltKey = deriveKey(salt);
  const scrambled = applyXor(buffer, saltKey);
  return Buffer.concat([MAGIC_PREFIX, scrambled], MAGIC_PREFIX.length + scrambled.length);
}

/**
 * Desalt / De-obfuscate an image buffer back to original valid image bytes
 */
export function desaltBuffer(buffer, salt) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length <= MAGIC_PREFIX.length) {
    return buffer;
  }
  // If not salted, return as-is (backward compatible with seed/legacy images)
  if (!isSalted(buffer)) {
    return buffer;
  }

  const payload = buffer.subarray(MAGIC_PREFIX.length);
  const saltKey = deriveKey(salt);
  return applyXor(payload, saltKey);
}

/**
 * Salt a file directly on disk
 */
export function saltFile(filePath, salt) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath);
  if (isSalted(content)) return false; // Already salted

  const salted = saltBuffer(content, salt);
  fs.writeFileSync(filePath, salted);
  return true;
}

/**
 * Desalt a file directly on disk
 */
export function desaltFile(filePath, salt) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath);
  if (!isSalted(content)) return false; // Not salted

  const desalted = desaltBuffer(content, salt);
  fs.writeFileSync(filePath, desalted);
  return true;
}

export default {
  MAGIC_PREFIX,
  deriveKey,
  isSalted,
  saltBuffer,
  desaltBuffer,
  saltFile,
  desaltFile
};
