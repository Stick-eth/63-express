/**
 * StorageUtils - Simple obfuscation for localStorage data
 * Uses base64 + XOR cipher to make data less readable/editable
 * Note: This is NOT encryption, just obfuscation for casual tampering
 */

const CIPHER_KEY = 'BH2025'; // Simple obfuscation key, Binary Hustle 2025 t'as capté

function xorCipher(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

export class StorageUtils {
    /**
     * Encode data for storage
     */
    static encode(data) {
        try {
            const json = JSON.stringify(data);
            const xored = xorCipher(json, CIPHER_KEY);
            return btoa(encodeURIComponent(xored));
        } catch {
            return null;
        }
    }

    /**
     * Decode data from storage
     */
    static decode(encoded) {
        try {
            const xored = decodeURIComponent(atob(encoded));
            const json = xorCipher(xored, CIPHER_KEY);
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    /**
     * Encode a simple value (number, string) for storage
     */
    static encodeValue(value) {
        return this.encode({ v: value });
    }

    /**
     * Decode a simple value from storage
     */
    static decodeValue(encoded, defaultValue = null) {
        const decoded = this.decode(encoded);
        return decoded?.v ?? defaultValue;
    }

    /**
     * Set obfuscated item in localStorage
     */
    static setItem(key, value) {
        const encoded = this.encode(value);
        if (encoded) {
            localStorage.setItem(key, encoded);
        }
    }

    /**
     * Get obfuscated item from localStorage
     */
    static getItem(key, defaultValue = null) {
        const raw = localStorage.getItem(key);
        if (!raw) return defaultValue;

        const decoded = this.decode(raw);
        return decoded ?? defaultValue;
    }

    /**
     * Set simple value (number, string) in localStorage
     */
    static setValue(key, value) {
        const encoded = this.encodeValue(value);
        if (encoded) {
            localStorage.setItem(key, encoded);
        }
    }

    /**
     * Get simple value from localStorage
     */
    static getValue(key, defaultValue = null) {
        const raw = localStorage.getItem(key);
        if (!raw) return defaultValue;

        return this.decodeValue(raw, defaultValue);
    }
}
