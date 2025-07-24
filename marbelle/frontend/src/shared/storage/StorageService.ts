/**
 * StorageService - Generic service for localStorage and sessionStorage operations
 * Provides type-safe storage operations with error handling
 */
export class StorageService {
    private storage: Storage;
    private storageName: string;
    private storageAvailable: boolean;

    constructor(storage: Storage, storageName: string) {
        this.storage = storage;
        this.storageName = storageName;
        this.storageAvailable = this.checkStorageAvailability();
    }

    private checkStorageAvailability(): boolean {
        try {
            const test = '__storage_test__';
            this.storage.setItem(test, 'test');
            this.storage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    public setItem<T>(key: string, value: T): boolean {
        if (!this.storageAvailable) {
            console.warn(`${this.storageName} is not available`);
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            this.storage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Error setting ${this.storageName} item:`, error);
            return false;
        }
    }

    public getItem<T>(key: string): T | null {
        if (!this.storageAvailable) {
            return null;
        }

        try {
            const item = this.storage.getItem(key);
            if (item === null) {
                return null;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error getting ${this.storageName} item:`, error);
            return null;
        }
    }

    public removeItem(key: string): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${this.storageName} item:`, error);
            return false;
        }
    }

    public clear(): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error(`Error clearing ${this.storageName}:`, error);
            return false;
        }
    }

    public hasItem(key: string): boolean {
        if (!this.storageAvailable) {
            return false;
        }

        return this.storage.getItem(key) !== null;
    }

    public getAllKeys(): string[] {
        if (!this.storageAvailable) {
            return [];
        }

        return Object.keys(this.storage);
    }

    public getSize(): number {
        if (!this.storageAvailable) {
            return 0;
        }

        return this.storage.length;
    }

    public isAvailable(): boolean {
        return this.storageAvailable;
    }
}
