/**
 * Dashboard Service - Handles all dashboard-related API calls
 * Manages user profile, addresses, and order history
 */
import { apiClient } from '../../../shared/api/ApiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../../shared/api/apiConfig';
import { localStorageService } from '../../../shared/storage/LocalStorageService';
import type { User } from '../../auth/types/auth';
import type {
    Address,
    AddressFormData,
    ProfileUpdateData,
    PasswordChangeData,
    Order,
    AddressResponse,
    ProfileResponse,
    OrderHistoryResponse,
    ApiResponse,
} from '../types/dashboard';

export class DashboardService {
    private static instance: DashboardService;

    private constructor() {}

    public static getInstance(): DashboardService {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }

    // ===== PROFILE MANAGEMENT =====

    /**
     * Get user profile data
     */
    public async getUserProfile(): Promise<User> {
        return await apiClient.get<User>(API_ENDPOINTS.AUTH.USER_PROFILE);
    }

    /**
     * Update user profile
     */
    public async updateProfile(data: ProfileUpdateData): Promise<User> {
        const updatedUser = await apiClient.put<User>(API_ENDPOINTS.AUTH.USER_PROFILE, data);
        
        // Update stored user data
        if (updatedUser) {
            this.updateStoredUserData(updatedUser);
        }

        return updatedUser;
    }

    /**
     * Change password
     */
    public async changePassword(data: PasswordChangeData): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    }

    // ===== ADDRESS MANAGEMENT =====

    /**
     * Get all user addresses
     */
    public async getAddresses(): Promise<Address[]> {
        const response = await apiClient.get<AddressResponse['data']>(API_ENDPOINTS.AUTH.ADDRESSES);
        return response?.addresses || [];
    }

    /**
     * Create new address
     */
    public async createAddress(data: AddressFormData): Promise<Address> {
        return await apiClient.post<Address>(API_ENDPOINTS.AUTH.ADDRESSES, data);
    }

    /**
     * Update existing address
     */
    public async updateAddress(id: number, data: AddressFormData): Promise<Address> {
        const endpoint = API_ENDPOINTS.AUTH.ADDRESS_DETAIL.replace(':id', id.toString());
        return await apiClient.put<Address>(endpoint, data);
    }

    /**
     * Delete address
     */
    public async deleteAddress(id: number): Promise<void> {
        const endpoint = API_ENDPOINTS.AUTH.ADDRESS_DETAIL.replace(':id', id.toString());
        await apiClient.delete(endpoint);
    }

    /**
     * Set primary address
     */
    public async setPrimaryAddress(id: number): Promise<Address> {
        const endpoint = API_ENDPOINTS.AUTH.SET_PRIMARY_ADDRESS.replace(':id', id.toString());
        return await apiClient.patch<Address>(endpoint, {});
    }

    // ===== ORDER MANAGEMENT =====

    /**
     * Get user order history
     * Note: Orders API not yet implemented - returns empty array
     */
    public async getOrderHistory(page?: number, limit?: number): Promise<OrderHistoryResponse['data']> {
        // TODO: Remove this mock implementation when orders API is ready
        return Promise.resolve({
            orders: [],
            count: 0,
            next: undefined,
            previous: undefined,
        });

        // Uncomment when orders API is implemented:
        // const params = new URLSearchParams();
        // if (page) params.append('page', page.toString());
        // if (limit) params.append('limit', limit.toString());
        // const endpoint = `${API_ENDPOINTS.ORDERS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
        // return await apiClient.get<OrderHistoryResponse['data']>(endpoint);
    }

    /**
     * Get specific order details
     * Note: Orders API not yet implemented - throws error
     */
    public async getOrderDetails(orderId: number): Promise<Order> {
        // TODO: Remove this mock implementation when orders API is ready
        throw new Error('Order details API not yet implemented');

        // Uncomment when orders API is implemented:
        // const endpoint = API_ENDPOINTS.ORDERS.DETAIL.replace(':id', orderId.toString());
        // return await apiClient.get<Order>(endpoint);
    }

    // ===== UTILITY METHODS =====

    /**
     * Get current user data from storage
     */
    public getCurrentUser(): User | null {
        return localStorageService.getItem<User>(STORAGE_KEYS.USER_DATA);
    }

    /**
     * Update stored user data
     */
    private updateStoredUserData(user: User): void {
        localStorageService.setItem(STORAGE_KEYS.USER_DATA, user);
    }

    /**
     * Refresh all user-related data
     */
    public async refreshUserData(): Promise<{
        user: User;
        addresses: Address[];
        orders: Order[];
    }> {
        try {
            const [user, addresses, orderHistory] = await Promise.all([
                this.getUserProfile(),
                this.getAddresses(),
                this.getOrderHistory(1, 10), // Get recent orders (currently mocked)
            ]);

            return {
                user,
                addresses,
                orders: orderHistory?.orders || [],
            };
        } catch (error) {
            // If orders API fails, still return user and addresses
            const [user, addresses] = await Promise.all([
                this.getUserProfile(),
                this.getAddresses(),
            ]);

            return {
                user,
                addresses,
                orders: [], // Empty orders if API not available
            };
        }
    }

    /**
     * Validate address form data
     */
    public validateAddressData(data: AddressFormData): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!data.label.trim()) {
            errors.label = 'Address label is required';
        }

        if (!data.first_name.trim()) {
            errors.first_name = 'First name is required';
        }

        if (!data.last_name.trim()) {
            errors.last_name = 'Last name is required';
        }

        if (!data.address_line_1.trim()) {
            errors.address_line_1 = 'Address line 1 is required';
        }

        if (!data.city.trim()) {
            errors.city = 'City is required';
        }

        if (!data.state.trim()) {
            errors.state = 'State is required';
        }

        if (!data.postal_code.trim()) {
            errors.postal_code = 'Postal code is required';
        }

        if (!data.country.trim()) {
            errors.country = 'Country is required';
        }

        // Validate phone if provided
        if (data.phone && data.phone.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
                errors.phone = 'Please enter a valid phone number';
            }
        }

        return errors;
    }

    /**
     * Validate profile update data
     */
    public validateProfileData(data: ProfileUpdateData): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!data.first_name.trim()) {
            errors.first_name = 'First name is required';
        }

        if (!data.last_name.trim()) {
            errors.last_name = 'Last name is required';
        }

        if (!data.email.trim()) {
            errors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errors.email = 'Please enter a valid email address';
            }
        }

        // Validate phone if provided
        if (data.phone && data.phone.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
                errors.phone = 'Please enter a valid phone number';
            }
        }

        return errors;
    }

    /**
     * Validate password change data
     */
    public validatePasswordData(data: PasswordChangeData): Record<string, string> {
        const errors: Record<string, string> = {};

        if (!data.current_password) {
            errors.current_password = 'Current password is required';
        }

        if (!data.new_password) {
            errors.new_password = 'New password is required';
        } else if (data.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters long';
        }

        if (!data.new_password_confirm) {
            errors.new_password_confirm = 'Password confirmation is required';
        } else if (data.new_password !== data.new_password_confirm) {
            errors.new_password_confirm = 'Passwords do not match';
        }

        if (data.current_password === data.new_password) {
            errors.new_password = 'New password must be different from current password';
        }

        return errors;
    }

    /**
     * Check if user can add more addresses
     */
    public canAddMoreAddresses(currentCount: number): boolean {
        return currentCount < 10; // Business rule: max 10 addresses
    }

    /**
     * Get address limits information
     */
    public getAddressLimits(currentCount: number): { maxAddresses: number; currentCount: number; canAddMore: boolean } {
        return {
            maxAddresses: 10,
            currentCount,
            canAddMore: this.canAddMoreAddresses(currentCount),
        };
    }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();