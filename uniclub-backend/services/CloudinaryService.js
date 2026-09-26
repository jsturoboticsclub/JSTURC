const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  console.log('✅ Cloudinary initialized for cloud:', cloudName);
} else {
  console.warn('⚠️ Cloudinary not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
}

/**
 * Upload an image (base64 string, URL, or buffer data URI) to Cloudinary
 * @param {string} fileData - Base64 Data URI or image URL
 * @param {string} folder - Destination folder on Cloudinary
 * @param {string} [publicId] - Optional public ID
 * @returns {Promise<string>} - Returns secure CDN URL
 */
async function uploadImage(fileData, folder = 'jstu_robotics/general', publicId = null) {
  if (!isConfigured) {
    console.warn('⚠️ Cloudinary is not configured. Returning original image string.');
    return fileData;
  }

  try {
    const options = {
      folder,
      resource_type: 'image',
      overwrite: true,
      invalidate: true
    };

    if (publicId) {
      options.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(fileData, options);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw error;
  }
}

/**
 * Delete an image by its public_id
 * @param {string} publicId
 */
async function deleteImage(publicId) {
  if (!isConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('❌ Cloudinary delete failed:', err);
  }
}

module.exports = {
  cloudinary,
  isConfigured,
  uploadImage,
  deleteImage
};
