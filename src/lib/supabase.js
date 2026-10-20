import { createClient } from '@supabase/supabase-js';
import { compressImageClient } from '../utils/imageCompressor';

// Support both standard Vite (VITE_) and Next.js (NEXT_PUBLIC_) environment variables
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://vjcllwgikivvvyxrvylx.supabase.co';

const supabaseKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_a2DtzC-gZLrp5gdSpPbB3A_JrWVTWwU';

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
    throw new Error(`Gagal mengunggah foto ke Supabase Storage (Bucket: ${usedBucket}): ${lastError?.message || 'Pastikan bucket berstatus Public dan sudah memiliki Storage Policy'}`);
  }

  // 4. Retrieve permanent public CDN URL
  const { data: publicUrlData } = supabase.storage
    .from(usedBucket)
    .getPublicUrl(uploadResult.path);

  return {
    url: publicUrlData.publicUrl,
    path: uploadResult.path
  };
}

/**
 * Delete an image file from Supabase Storage by full URL or storage path.
 * @param {string} fileUrlOrPath 
 */
export async function deleteImageFromSupabase(fileUrlOrPath) {
  if (!supabase || !fileUrlOrPath) return;

  try {
    let storagePath = fileUrlOrPath;
    if (fileUrlOrPath.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) {
      storagePath = fileUrlOrPath.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
    }

    if (storagePath) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    }
  } catch (err) {
    console.warn('Gagal menghapus foto dari Supabase storage:', err);
  }
}
