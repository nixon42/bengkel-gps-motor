/**
 * Client-Side Image Resizer & Compressor
 * Bengkel Mobil GPS Motor Kediri
 *
 * Compresses camera captures and gallery uploads before sending over mobile networks.
 * Target size: ~100KB, max dimension: 1280px, format: image/jpeg.
 * Preserves original file if compression fails or if input is a PDF/non-image.
 *
 * @param {File} file - Original file from input
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1280] - Max width
 * @param {number} [options.maxHeight=1280] - Max height
 * @param {number} [options.quality=0.8] - JPEG quality (0.0 to 1.0)
 * @returns {Promise<File>} Compressed File or original file
 */
export async function compressImageClient(file, { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = {}) {
  if (!file || typeof window === 'undefined') return file;
  if (!file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file; // Skip non-images (e.g. PDF)
  }

  // If already under 120KB and likely not high-res, skip
  if (file.size <= 120 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio constrained bounding box
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with target quality
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default compressImageClient;
