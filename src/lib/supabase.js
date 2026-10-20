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

export const BUCKET_NAME = 'bengkel-photos';

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

  // 3. Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, compressed, {
      cacheControl: '31536000',
      upsert: false,
      contentType: compressed.type || 'image/jpeg'
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(`Gagal mengunggah foto ke Supabase: ${error.message}`);
  }

  // 4. Retrieve permanent public CDN URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path
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
