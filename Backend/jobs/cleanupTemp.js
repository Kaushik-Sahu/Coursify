
/**
 * @fileoverview Background job that periodically cleans up stale assets
 * from the Cloudinary `coursify/temp` folder. Runs every 6 hours.
 */

const { cleanupTempFolder } = require('../utils/cloudinary');

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Starts the temp folder cleanup job.
 * Runs immediately on startup and then repeats every 6 hours.
 */
const startCleanupJob = () => {
    console.log('[CleanupJob] Starting Cloudinary temp folder cleanup job (every 6 hours).');

    // Run once immediately on startup
    cleanupTempFolder();

    // Schedule recurring cleanup every 6 hours
    setInterval(() => {
        cleanupTempFolder();
    }, SIX_HOURS_MS);
};

module.exports = { startCleanupJob };
