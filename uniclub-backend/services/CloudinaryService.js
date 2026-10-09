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
 * Standardized folder structure mapping for JSTU Robotics Club
 */
const CLOUDINARY_FOLDER_MAP = {
  avatars: 'jstu_robotics/members/avatars',
  avatar: 'jstu_robotics/members/avatars',
  covers: 'jstu_robotics/members/covers',
  cover: 'jstu_robotics/members/covers',
  members: 'jstu_robotics/members/avatars',
  hardware: 'jstu_robotics/hardware',
  showcase: 'jstu_robotics/hardware',
  projects: 'jstu_robotics/projects',
  events: 'jstu_robotics/events',
  news: 'jstu_robotics/news',
  cms: 'jstu_robotics/cms',
  general: 'jstu_robotics/general'
};

function resolveFolder(categoryOrFolder) {
  if (!categoryOrFolder) return 'jstu_robotics/general';
  if (categoryOrFolder.startsWith('jstu_robotics/')) return categoryOrFolder;
  const key = categoryOrFolder.toLowerCase().trim();
  return CLOUDINARY_FOLDER_MAP[key] || `jstu_robotics/${key}`;
}

/**
 * Upload an image (base64 string, URL, or buffer data URI) to Cloudinary
 * Organizes cleanly by domain folders and assigns tags for easy searchability
 * @param {string} fileData - Base64 Data URI or image URL
 * @param {string} folder - Destination category or folder on Cloudinary
 * @param {string} [publicId] - Optional public ID (slug)
 * @returns {Promise<string>} - Returns secure CDN URL
 */
async function uploadImage(fileData, folder = 'general', publicId = null) {
  if (!isConfigured) {
    console.warn('⚠️ Cloudinary is not configured. Returning original image string.');
    return fileData;
  }

  try {
    const targetFolder = resolveFolder(folder);
    const subCategory = targetFolder.split('/').pop() || 'media';
    const timestamp = Date.now();

    const options = {
      folder: targetFolder,
      resource_type: 'image',
      overwrite: true,
      invalidate: true,
      tags: ['jstu_robotics', subCategory]
    };

    if (publicId) {
      // Clean and sanitize custom public ID
      const sanitizedId = String(publicId)
        .replace(/\.[^/.]+$/, '') // strip extension if present
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      options.public_id = `${sanitizedId}_${timestamp}`;
    } else {
      options.public_id = `${subCategory}_${timestamp}`;
    }

    const result = await cloudinary.uploader.upload(fileData, options);
    console.log(`📸 [Cloudinary] Stored in folder: ${targetFolder}/${result.public_id} (${result.secure_url})`);
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
  resolveFolder,
  uploadImage,
  deleteImage
};

