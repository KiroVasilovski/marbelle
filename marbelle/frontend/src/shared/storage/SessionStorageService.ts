/**
 * SessionStorageService - Centralized service for sessionStorage operations
 * Uses the generic StorageService with sessionStorage
 */
import { StorageService } from './StorageService';

// Export the sessionStorage service instance
export const sessionStorageService = new StorageService(sessionStorage, 'SessionStorage');

// Export the class type for compatibility
export type SessionStorageService = StorageService;