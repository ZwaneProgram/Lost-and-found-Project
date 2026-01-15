import imageCompression from 'browser-image-compression';

export interface ImageOptimizationOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const defaultOptions: ImageOptimizationOptions = {
  maxSizeMB: 2.5, // Target 2.5MB (under 3MB limit)
  maxWidthOrHeight: 1920, // Resize to max 1920px
  useWebWorker: true,
};

/**
 * Optimizes an image file by compressing and resizing it
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Promise<File> - Optimized image file
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (before optimization)
    if (file.size > 10 * 1024 * 1024) { // 10MB limit before optimization
      throw new Error('Image is too large. Maximum size is 10MB before optimization.');
    }

    // Compress and resize the image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB!,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight!,
      useWebWorker: mergedOptions.useWebWorker,
      fileType: file.type,
    });

    // Double-check the size is under 3MB
    if (compressedFile.size > 3 * 1024 * 1024) {
      // If still too large, compress more aggressively
      const moreCompressed = await imageCompression(file, {
        maxSizeMB: 2, // More aggressive compression
        maxWidthOrHeight: 1600,
        useWebWorker: mergedOptions.useWebWorker,
        fileType: file.type,
      });
      
      if (moreCompressed.size > 3 * 1024 * 1024) {
        throw new Error('Image could not be compressed below 3MB. Please use a smaller image.');
      }
      
      return moreCompressed;
    }

    return compressedFile;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to optimize image');
  }
}

/**
 * Creates a preview URL from a file
 * @param file - The file to create a preview from
 * @returns string - Preview URL
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a preview URL to free memory
 * @param url - The preview URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
