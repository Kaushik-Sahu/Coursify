
/**
 * @fileoverview Cloudinary SDK configuration and helper functions for
 * signed uploads, asset management, signed URL generation, and temp cleanup.
 */

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Generates a Cloudinary signed upload payload for client-side direct uploads.
 * @param {'image'|'video'} resourceType - The type of resource being uploaded.
 * @param {string} creatorId - The ID of the creator initiating the upload.
 * @returns {object} Signed upload payload including signature, timestamp, api_key, etc.
 */
const generateSignature = (resourceType, creatorId) => {
    const maxVideoSizeMB = parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 500;
    const maxThumbnailSizeMB = parseInt(process.env.MAX_THUMBNAIL_SIZE_MB, 10) || 10;

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'coursify/temp';

    const paramsToSign = {
        folder,
        timestamp,
        type: 'authenticated'
    };

    // Add eager transformation for video uploads
    if (resourceType === 'video') {
        paramsToSign.eager = 'sp_auto';
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    const maxFileSize = resourceType === 'video'
        ? maxVideoSizeMB * 1024 * 1024
        : maxThumbnailSizeMB * 1024 * 1024;

    return {
        signature,
        timestamp,
        type: 'authenticated',
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        resource_type: resourceType,
        max_file_size: maxFileSize
    };
};

/**
 * Moves an asset from the temporary folder to a permanent folder by renaming.
 * @param {string} tempPublicId - The current public_id of the asset in the temp folder.
 * @param {string} permanentFolder - The destination folder path (e.g. 'coursify/courses/123').
 * @param {'image'|'video'} resourceType - The type of resource.
 * @returns {Promise<object>} The Cloudinary rename result with new public_id and secure_url.
 */
const moveAsset = async (tempPublicId, permanentFolder, resourceType) => {
    // Extract the filename from the temp public_id (e.g. 'coursify/temp/abc123' -> 'abc123')
    const filename = tempPublicId.split('/').pop();
    const newPublicId = `${permanentFolder}/${filename}`;

    const result = await cloudinary.uploader.rename(tempPublicId, newPublicId, {
        resource_type: resourceType,
        type: 'authenticated'
    });

    // For Dynamic Folder Mode accounts, also update the asset_folder path
    try {
        await cloudinary.api.update(newPublicId, {
            asset_folder: permanentFolder,
            resource_type: resourceType,
            type: 'authenticated'
        });
    } catch (updateErr) {
        console.log('[Cloudinary Move] asset_folder update not applied or ignored:', updateErr.message);
    }

    return result;
};

/**
 * Deletes an asset from Cloudinary.
 * @param {string} publicId - The public_id of the asset to delete.
 * @param {'image'|'video'} resourceType - The type of resource.
 * @returns {Promise<object>} The Cloudinary destroy result.
 */
const deleteAsset = async (publicId, resourceType) => {
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: 'authenticated'
    });

    return result;
};

/**
 * Deletes an empty folder from Cloudinary.
 * @param {string} folderPath - The path of the folder to delete.
 * @returns {Promise<object>} The Cloudinary delete_folder result.
 */
const deleteFolder = async (folderPath) => {
    try {
        const result = await cloudinary.api.delete_folder(folderPath);
        return result;
    } catch (error) {
        console.error(`Failed to delete Cloudinary folder ${folderPath}:`, error.message);
        throw error;
    }
};

/**
 * Generates a time-limited signed URL for accessing an asset.
 * @param {string} publicId - The public_id of the asset.
 * @param {'image'|'video'} resourceType - The type of resource.
 * @returns {string} A signed URL valid for 2 hours.
 */
const generateSignedUrl = (publicId, resourceType) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now

    if (resourceType === 'video') {
        return cloudinary.url(publicId, {
            resource_type: 'video',
            type: 'authenticated',
            sign_url: true,
            secure: true,
            expires_at: expiresAt,
            format: 'mp4'
        });
    }

    return cloudinary.url(publicId, {
        type: 'authenticated',
        sign_url: true,
        secure: true,
        expires_at: expiresAt
    });
};

/**
 * Cleans up stale assets in the `coursify/temp` folder.
 * Deletes any asset older than 24 hours. Intended to be called periodically.
 * @returns {Promise<void>}
 */
const cleanupTempFolder = async () => {
    try {
        const result = await cloudinary.api.resources({
            type: 'authenticated',
            prefix: 'coursify/temp',
            max_results: 100
        });

        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        let deletedCount = 0;

        for (const resource of result.resources) {
            const createdAt = new Date(resource.created_at).getTime();

            if (now - createdAt > twentyFourHours) {
                await cloudinary.uploader.destroy(resource.public_id, {
                    resource_type: resource.resource_type,
                    type: 'authenticated'
                });
                deletedCount++;
            }
        }

        console.log(`[Cloudinary Cleanup] Cleaned up ${deletedCount} stale temp asset(s).`);
    } catch (error) {
        console.error('[Cloudinary Cleanup] Error cleaning temp folder:', error);
    }
};

module.exports = {
    generateSignature,
    moveAsset,
    deleteAsset,
    deleteFolder,
    generateSignedUrl,
    cleanupTempFolder
};
