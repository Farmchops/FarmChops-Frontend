// src/utils/secureStorage.ts

import CryptoJS from 'crypto-js';

// Generate a unique key per device (not production secret, just obfuscation)
const getEncryptionKey = (): string => {
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toDateString();
    return CryptoJS.SHA256(userAgent + timestamp).toString();
};

export const secureStorage = {
    setItem: (key: string, value: any): void => {
        try {
            const stringValue = JSON.stringify(value);
            const encrypted = CryptoJS.AES.encrypt(
                stringValue,
                getEncryptionKey()
            ).toString();
            sessionStorage.setItem(key, encrypted);
        } catch (error) {
            console.error('Error saving to secure storage:', error);
        }
    },

    getItem: (key: string): any | null => {
        try {
            const encrypted = sessionStorage.getItem(key);
            if (!encrypted) return null;

            const decrypted = CryptoJS.AES.decrypt(
                encrypted,
                getEncryptionKey()
            ).toString(CryptoJS.enc.Utf8);

            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Error reading from secure storage:', error);
            return null;
        }
    },

    removeItem: (key: string): void => {
        sessionStorage.removeItem(key);
    },

    clear: (): void => {
        sessionStorage.clear();
    },
};