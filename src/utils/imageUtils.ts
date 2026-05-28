/**
 * Compresses and resizes an image before upload.
 * Optimized for speed: Uses ObjectURL instead of FileReader to avoid memory-heavy Base64 conversion.
 */
export const compressImage = (
  file: File | Blob,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.6
): Promise<{ blob: Blob; preview: string }> => {
  return new Promise((resolve, reject) => {
    // URL.createObjectURL is nearly instantaneous and much more memory-efficient than FileReader
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.src = objectUrl;
    img.onload = () => {
      // Clean up the object URL as soon as the image is loaded into memory
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Fast image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium"; // 'high' can be slow on mobile, 'medium' is a good balance
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const preview = URL.createObjectURL(blob);
            resolve({ blob, preview });
          } else {
            reject(new Error("Canvas to Blob conversion failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
};
