import { createClient } from '@supabase/supabase-js';
import { compressImageClient } from '../utils/imageCompressor';

// Support both standard Vite (VITE_) and Next.js (NEXT_PUBLIC_) environment variables
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const BUCKET_NAME = 
  import.meta.env.VITE_SUPABASE_BUCKET || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_BUCKET || 
  'bucket3';

/**
 * Upload an image file to Supabase Storage bucket with client-side auto-compression (~100KB).
 * @param {File} file 
 * @param {string} [folder='ro'] - Subfolder in bucket (e.g. 'ro', 'receipts', 'tenants')
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadImageToSupabase(file, folder = 'ro') {
  if (!supabase) {
    throw new Error('Supabase client belum dikonfigurasi. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
  }

  // 1. Compress image to ~100KB before uploading to save mobile data & storage
  const compressed = await compressImageClient(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 });
  
  // 2. Generate a collision-free safe filename
  const cleanExt = compressed.type === 'image/png' ? 'png' : 'jpg';
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const fileName = `${folder}/${Date.now()}_${randomSuffix}.${cleanExt}`;

  // 3. Upload to Supabase Storage - try configured bucket candidates
  const bucketCandidates = [BUCKET_NAME, 'bucket3', 'bengkel-photos'].filter((v, i, a) => a.indexOf(v) === i);

  let uploadResult = null;
  let usedBucket = BUCKET_NAME;
  let lastError = null;

  for (const b of bucketCandidates) {
    const { data, error } = await supabase.storage
      .from(b)
      .upload(fileName, compressed, {
        cacheControl: '31536000',
        upsert: false,
        contentType: compressed.type || 'image/jpeg'
      });

    if (!error && data) {
      uploadResult = data;
      usedBucket = b;
      break;
    } else {
      lastError = error;
    }
  }

  if (!uploadResult) {
    console.error('Supabase Storage upload error:', lastError);
    throw new Error(`Gagal mengunggah foto ke Supabase Storage (Bucket: ${usedBucket}): ${lastError?.message || 'Periksa Storage Policies di Supabase Dashboard'}`);
  }

  // 4. Retrieve signed URL (valid for 1 hour) for private buckets, or fallback to public URL
  let photoUrl = '';
  try {
    const { data: signedData, error: signErr } = await supabase.storage
      .from(usedBucket)
      .createSignedUrl(uploadResult.path, 3600);
    if (!signErr && signedData?.signedUrl) {
      photoUrl = signedData.signedUrl;
    }
  } catch (e) {
    console.warn('Could not generate initial signed URL:', e);
  }

  if (!photoUrl) {
    const { data: publicUrlData } = supabase.storage
      .from(usedBucket)
      .getPublicUrl(uploadResult.path);
    photoUrl = publicUrlData?.publicUrl || uploadResult.path;
  }

  return {
    url: photoUrl,
    path: uploadResult.path,
    bucket: usedBucket
  };
}

/**
 * Resolves an image path or Supabase Storage URL into a secure, temporary Signed URL (default: 1 hour).
 * Handles Private Buckets seamlessly without exposing files publicly.
 *
 * @param {string} pathOrUrl - Storage path ('ro/123.jpg') or full Supabase URL
 * @param {number} [expiresIn=3600] - Token validity in seconds (default: 3600s / 1 hour)
 * @returns {Promise<string>} Secure signed URL or original path
 */
export async function getSignedImageUrl(pathOrUrl, expiresIn = 3600) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';

  // Local static assets (/images/...) or data/blob URIs do not need signing
  if (pathOrUrl.startsWith('/') || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('blob:')) {
    return pathOrUrl;
  }

  if (!supabase) return pathOrUrl;

  // External images not hosted in this Supabase project
  if (pathOrUrl.startsWith('http') && !pathOrUrl.includes(supabaseUrl)) {
    return pathOrUrl;
  }

  // Parse bucket and object path from Supabase storage URL
  let bucketName = BUCKET_NAME;
  let objectPath = pathOrUrl;

  const storageMatch = pathOrUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (storageMatch) {
    bucketName = storageMatch[1];
    objectPath = storageMatch[2];
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(objectPath, expiresIn);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  } catch (err) {
    console.warn(`Gagal membuat Signed URL untuk ${objectPath}:`, err);
  }

  // Fallback: try public URL if signed URL creation fails
  try {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
    return data?.publicUrl || pathOrUrl;
  } catch {
    return pathOrUrl;
  }
}

/**
 * Delete an image file from Supabase Storage by full URL or storage path.
 * @param {string} fileUrlOrPath 
 */
export async function deleteImageFromSupabase(fileUrlOrPath) {
  if (!supabase || !fileUrlOrPath) return;

  try {
    let storagePath = fileUrlOrPath;
    let bucket = BUCKET_NAME;

    const match = fileUrlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
    if (match) {
      bucket = match[1];
      storagePath = match[2];
    }

    if (storagePath) {
      await supabase.storage.from(bucket).remove([storagePath]);
    }
  } catch (err) {
    console.warn('Gagal menghapus foto dari Supabase storage:', err);
  }
}
