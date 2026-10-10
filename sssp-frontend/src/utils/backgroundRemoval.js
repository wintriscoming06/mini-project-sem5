import { removeBackground } from '@imgly/background-removal';

/**
 * Read File or Blob to Base64 Data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Cut out player background using client-side AI (@imgly/background-removal)
 * Returns a base64 PNG data URL with transparent background.
 */
export const removePlayerPhotoBackground = async (imageSource, onProgress) => {
  try {
    const config = {
      progress: (key, current, total) => {
        if (onProgress && total > 0) {
          const pct = Math.round((current / total) * 100);
          onProgress(pct, key);
        }
      }
    };

    const blob = await removeBackground(imageSource, config);
    const dataUrl = await fileToDataUrl(blob);
    return { success: true, dataUrl };
  } catch (err) {
    console.warn('Background removal error, falling back to raw image:', err);
    // Graceful fallback to raw image if imageSource is a File
    if (imageSource instanceof Blob) {
      const fallbackUrl = await fileToDataUrl(imageSource);
      return { success: false, dataUrl: fallbackUrl, error: err.message };
    }
    return { success: false, dataUrl: imageSource, error: err.message };
  }
};

export { removePlayerPhotoBackground as removeBackground };
