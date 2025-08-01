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
    EmailChangeRequestData,
    EmailChangeConfirmData,
    EmailChangeResponse,
    Order,
    AddressResponse,
    OrderHistoryResponse,
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

    // ===== EMAIL CHANGE MANAGEMENT =====

    /**
     * Request email change (step 1 of email change process)
     */
    public async requestEmailChange(data: EmailChangeRequestData): Promise<EmailChangeResponse> {
        return await apiClient.post<EmailChangeResponse>(API_ENDPOINTS.AUTH.REQUEST_EMAIL_CHANGE, data);
    }

    /**
     * Confirm email change with token (step 2 of email change process)
     */
    public async confirmEmailChange(data: EmailChangeConfirmData): Promise<User> {
        const response = await apiClient.post<EmailChangeResponse>(API_ENDPOINTS.AUTH.CONFIRM_EMAIL_CHANGE, data);

        // Update stored user data with new email
        if (response?.data) {
            this.updateStoredUserData(response.data);
        }

        return response?.data || ({} as User);
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
        console.log(page, limit);
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
        console.log(orderId);
        throw new Error('Order details API not yet implemented');

        // Uncomment when orders API is implemented:
        // const endpoint = API_ENDPOINTS.ORDERS.DETAIL.replace(':id', orderId.toString());
        // return await apiClient.get<Order>(endpoint);
    }

    // ===== UTILITY METHODS =====

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
            const [user, addresses] = await Promise.all([this.getUserProfile(), this.getAddresses()]);

            return {
                user,
                addresses,
                orders: [], // Empty orders if API not available
            };
        }
    }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
