/**
 * @fileoverview Database seed script for creating the initial "Root" superadmin.
 * Reads credentials from environment variables and creates a SuperAdmin record
 * if one does not already exist. This runs on every server startup but is idempotent.
 */

const bcrypt = require('bcrypt');
const { SuperAdmin } = require('./db');

/**
 * Seeds the root superadmin account using environment variables.
 * - If any required env var is missing, logs a warning and skips (non-fatal).
 * - If a SuperAdmin with the given email already exists, skips (idempotent).
 * - Otherwise, hashes the password and creates the SuperAdmin document.
 */
const seedRootSuperAdmin = async () => {
    const { SUPERADMIN_USERNAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } = process.env;

    // If any credential is missing, warn and skip — don't block server startup.
    if (!SUPERADMIN_USERNAME || !SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
        console.warn('⚠️  SuperAdmin seed skipped: SUPERADMIN_USERNAME, SUPERADMIN_EMAIL, or SUPERADMIN_PASSWORD not set in .env');
        return;
    }

    try {
        // Check if a superadmin with this email already exists (idempotent).
        const existing = await SuperAdmin.findOne({ email: SUPERADMIN_EMAIL });
        if (existing) {
            console.log('ℹ️  Root superadmin already exists, skipping seed.');
            return;
        }

        const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

        await SuperAdmin.create({
            username: SUPERADMIN_USERNAME,
            email: SUPERADMIN_EMAIL,
            password: hashedPassword
        });

        console.log('✅ Root superadmin seeded successfully.');
    } catch (error) {
        // Log but don't crash — the app can still function, just without a superadmin.
        console.error('❌ Failed to seed root superadmin:', error.message);
    }
};

module.exports = { seedRootSuperAdmin };
