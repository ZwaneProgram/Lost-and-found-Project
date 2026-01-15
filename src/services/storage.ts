import { optimizeImage } from '../utils/imageOptimizer';

// Cloudinary configuration (free tier: 25GB storage, 25GB bandwidth/month)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Upload an image using Cloudinary (free tier: 25GB storage, 25GB bandwidth/month)
 * @param file - The image file to upload
 * @param itemId - The ID of the Lost & Found item
 * @returns Promise<string> - Download URL of the uploaded image
 */
async function uploadImageToCloudinary(file: File, itemId: string): Promise<string> {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file');
    }

    // Optimize the image before uploading
    const optimizedFile = await optimizeImage(file);

    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'lost-found-board'); // Organize images in a folder
    formData.append('public_id', `${itemId}_${Date.now()}`); // Unique identifier
    
    // Note: Transformations (like f_auto,q_auto) must be configured in the upload preset
    // in Cloudinary dashboard, not sent as a parameter in unsigned uploads

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: { error?: { message?: string }; raw?: string } = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { raw: errorText };
      }
      console.error('Cloudinary upload error:', { status: response.status, errorData, errorText });
      throw new Error(errorData.error?.message || errorText || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Failed to get image URL from Cloudinary');
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

/**
 * Upload an image using Cloudinary
 * @param file - The image file to upload
 * @param itemId - The ID of the Lost & Found item
 * @returns Promise<string> - Download URL of the uploaded image
 */
export async function uploadImage(file: File, itemId: string): Promise<string> {
  return uploadImageToCloudinary(file, itemId);
}

/**
 * Delete an image from Cloudinary
 * Note: Cloudinary deletion requires server-side API with secret key
 * For client-side, we'll skip deletion - images will remain on Cloudinary
 * @param imageUrl - The URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Cloudinary deletion requires server-side API with secret key
  // For now, we'll skip deletion to keep it simple
  // Images will remain on Cloudinary (within free tier limits)
  if (imageUrl.includes('cloudinary.com')) {
    console.log('Cloudinary image deletion requires server-side API. Image will remain on Cloudinary.');
  }
}
