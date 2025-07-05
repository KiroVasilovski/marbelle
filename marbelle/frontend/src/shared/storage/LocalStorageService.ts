/**
 * LocalStorageService - Centralized service for localStorage operations
 * Provides type-safe localStorage operations with error handling
 */
export class LocalStorageService {
    private static instance: LocalStorageService;
    private storageAvailable: boolean;

    private constructor() {
        this.storageAvailable = this.checkStorageAvailability();
    }

    public static getInstance(): LocalStorageService {
        if (!LocalStorageService.instance) {
            LocalStorageService.instance = new LocalStorageService();
        }
        return LocalStorageService.instance;
    }

    private checkStorageAvailability(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    public setItem<T>(key: string, value: T): boolean {
        if (!this.storageAvailable) {
            console.warn('LocalStorage is not available');
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error setting localStorage item:', error);
            return false;
        }
    }

    public getItem<T>(key: string): T | null {
        if (!this.storageAvailable) {
            return null;
        }

        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return null;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.error('Error getting localStorage item:', error);
            return null;
        }
    }

    public removeItem(key: string): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage item:', error);
            return false;
        }
    }

    public clear(): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    public hasItem(key: string): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        return localStorage.getItem(key) !== null;
    }

    public getAllKeys(): string[] {
        if (!this.storageAvailable) {
            return [];
        }

        return Object.keys(localStorage);
    }

    public getSize(): number {
        if (!this.storageAvailable) {
            return 0;
        }

        return localStorage.length;
    }

    public isAvailable(): boolean {
        return this.storageAvailable;
    }
}

// Export singleton instance
export const localStorageService = LocalStorageService.getInstance();
