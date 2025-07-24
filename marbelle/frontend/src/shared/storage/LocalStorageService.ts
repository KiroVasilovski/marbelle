/**
 * LocalStorageService - Centralized service for localStorage operations
 * Uses the generic StorageService with localStorage
 */
import { StorageService } from './StorageService';

// Export the localStorage service instance
export const localStorageService = new StorageService(localStorage, 'LocalStorage');

// Export the class type for compatibility
export type LocalStorageService = StorageService;
