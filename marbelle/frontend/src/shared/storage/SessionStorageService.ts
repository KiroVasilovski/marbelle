/**
 * SessionStorageService - Centralized service for sessionStorage operations
 * Provides type-safe sessionStorage operations with error handling
 */
export class SessionStorageService {
    private static instance: SessionStorageService;
    private storageAvailable: boolean;

    private constructor() {
        this.storageAvailable = this.checkStorageAvailability();
    }

    public static getInstance(): SessionStorageService {
        if (!SessionStorageService.instance) {
            SessionStorageService.instance = new SessionStorageService();
        }
        return SessionStorageService.instance;
    }

    private checkStorageAvailability(): boolean {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, 'test');
            sessionStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    public setItem<T>(key: string, value: T): boolean {
        if (!this.storageAvailable) {
            console.warn('SessionStorage is not available');
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            sessionStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error setting sessionStorage item:', error);
            return false;
        }
    }

    public getItem<T>(key: string): T | null {
        if (!this.storageAvailable) {
            return null;
        }

        try {
            const item = sessionStorage.getItem(key);
            if (item === null) {
                return null;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.error('Error getting sessionStorage item:', error);
            return null;
        }
    }

    public removeItem(key: string): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing sessionStorage item:', error);
            return false;
        }
    }

    public clear(): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            sessionStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing sessionStorage:', error);
            return false;
        }
    }

    public hasItem(key: string): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        return sessionStorage.getItem(key) !== null;
    }

    public getAllKeys(): string[] {
        if (!this.storageAvailable) {
            return [];
        }

        return Object.keys(sessionStorage);
    }

    public getSize(): number {
        if (!this.storageAvailable) {
            return 0;
        }

        return sessionStorage.length;
    }

    public isAvailable(): boolean {
        return this.storageAvailable;
    }
}

// Export singleton instance
export const sessionStorageService = SessionStorageService.getInstance();
