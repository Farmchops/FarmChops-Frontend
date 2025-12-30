// src/lib/versionCheck.ts

/**
 * App version management utility
 * Automatically clears localStorage/sessionStorage when app version changes
 */

// Update this version when making breaking changes to storage structure or API
export const APP_VERSION = '1.0.0';

const VERSION_STORAGE_KEY = 'farmchops_app_version';

/**
 * Check if app version has changed and clear storage if needed
 * Call this during app initialization
 */
export const checkAppVersion = (): void => {
    try {
        const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

        if (storedVersion !== APP_VERSION) {
            console.log(
                `App version changed from ${storedVersion || 'unknown'} to ${APP_VERSION}. Clearing cache...`
            );

            // Clear all storage except the version key
            const keysToPreserve = [VERSION_STORAGE_KEY];

            // Clear localStorage
            const localStorageKeys = Object.keys(localStorage);
            localStorageKeys.forEach((key) => {
                if (!keysToPreserve.includes(key)) {
                    localStorage.removeItem(key);
                }
            });

            // Clear sessionStorage
            sessionStorage.clear();

            // Set new version
            localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);

            console.log('Cache cleared successfully due to version change');
        } else {
            console.log(`App version ${APP_VERSION} - no cache clear needed`);
        }
    } catch (error) {
        console.error('Error checking app version:', error);
    }
};

/**
 * Get current app version
 */
export const getAppVersion = (): string => {
    return APP_VERSION;
};

/**
 * Force clear all storage (useful for debugging)
 */
export const forceClearStorage = (): void => {
    console.warn('Force clearing all storage...');
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    console.log('Storage cleared');
};
