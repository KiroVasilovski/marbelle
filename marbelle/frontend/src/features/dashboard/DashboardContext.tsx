import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
    DashboardContextType,
    Address,
    Order,
    ProfileUpdateData,
    PasswordChangeData,
    AddressFormData,
} from './types/dashboard';
import type { User } from '../auth/types/auth';
import { dashboardService } from './services/dashboardService';
import { useAuth } from '../auth/AuthContext';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

interface DashboardProviderProps {
    children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
    // State management
    const [user, setUser] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // Loading states
    const [profileLoading, setProfileLoading] = useState(false);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Error states
    const [profileError, setProfileError] = useState<string | null>(null);
    const [addressesError, setAddressesError] = useState<string | null>(null);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    // Get auth context to sync user data
    const { user: authUser, isAuthenticated } = useAuth();

    // Initialize dashboard data when user is authenticated
    useEffect(() => {
        if (isAuthenticated && authUser) {
            setProfileLoading(true);
            setUser(authUser);
            initializeDashboardData().then(() => {
                setProfileLoading(false);
            });
        } else {
            // Clear dashboard data when user logs out
            clearDashboardData();
        }
    }, [isAuthenticated, authUser]);

    const clearDashboardData = (): void => {
        setUser(null);
        setAddresses([]);
        setOrders([]);
        clearErrors();
    };

    // ===== PROFILE MANAGEMENT =====

    const updateProfile = async (data: ProfileUpdateData): Promise<void> => {
        setProfileLoading(true);
        setProfileError(null);

        try {
            const updatedUser = await dashboardService.updateProfile(data);
            setUser(updatedUser);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'PROFILE UPDATE FAILED';
            setProfileError(errorMessage);
            throw error;
        } finally {
            setProfileLoading(false);
        }
    };

    const changePassword = async (data: PasswordChangeData): Promise<void> => {
        setProfileLoading(true);
        setProfileError(null);

        try {
            await dashboardService.changePassword(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'PASSWORD CHANGE FAILED';
            setProfileError(errorMessage);
            throw error;
        } finally {
            setProfileLoading(false);
        }
    };

    // ===== ADDRESS MANAGEMENT =====

    const fetchAddresses = useCallback(async (): Promise<void> => {
        setAddressesLoading(true);
        setAddressesError(null);

        try {
            const addressList = await dashboardService.getAddresses();
            setAddresses(addressList);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'FAILED TO LOAD ADDRESSES';
            setAddressesError(errorMessage);
        } finally {
            setAddressesLoading(false);
        }
    }, []);

    const createAddress = async (data: AddressFormData): Promise<void> => {
        setAddressesLoading(true);
        setAddressesError(null);

        try {
            const newAddress = await dashboardService.createAddress(data);
            setAddresses((prev) => [...prev, newAddress]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'FAILED TO CREATE ADDRESS';
            setAddressesError(errorMessage);
            throw error;
        } finally {
            setAddressesLoading(false);
        }
    };

    const updateAddress = async (id: number, data: AddressFormData): Promise<void> => {
        setAddressesLoading(true);
        setAddressesError(null);

        try {
            const updatedAddress = await dashboardService.updateAddress(id, data);
            setAddresses((prev) => prev.map((addr) => (addr.id === id ? updatedAddress : addr)));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'FAILED TO UPDATE ADDRESS';
            setAddressesError(errorMessage);
            throw error;
        } finally {
            setAddressesLoading(false);
        }
    };

    const deleteAddress = async (id: number): Promise<void> => {
        setAddressesLoading(true);
        setAddressesError(null);

        try {
            await dashboardService.deleteAddress(id);
            setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'FAILED TO DELETE ADDRESS';
            setAddressesError(errorMessage);
            throw error;
        } finally {
            setAddressesLoading(false);
        }
    };

    const setPrimaryAddress = async (id: number): Promise<void> => {
        setAddressesLoading(true);
        setAddressesError(null);

        try {
            await dashboardService.setPrimaryAddress(id);

            // Update addresses: set new primary and unset others
            setAddresses((prev) =>
                prev.map((addr) => ({
                    ...addr,
                    is_primary: addr.id === id,
                }))
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'FAILED TO SET PRIMARY ADDRESS';
            setAddressesError(errorMessage);
            throw error;
        } finally {
            setAddressesLoading(false);
        }
    };

    // ===== ORDER MANAGEMENT =====

    const fetchOrders = useCallback(async (): Promise<void> => {
        setOrdersLoading(true);
        setOrdersError(null);

        try {
            const orderHistory = await dashboardService.getOrderHistory(1, 20);
            setOrders(orderHistory || []);
        } catch (error) {
            // Orders API not yet implemented - don't show error, just log it
            console.info('Orders API not yet implemented, showing empty state');
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    // ===== UTILITY METHODS =====

    const clearErrors = (): void => {
        setProfileError(null);
        setAddressesError(null);
        setOrdersError(null);
    };

    const refreshUserData = async (): Promise<void> => {
        try {
            const refreshedData = await dashboardService.refreshUserData();
            setUser(refreshedData.user);
            setAddresses(refreshedData.addresses);
            setOrders(refreshedData.orders);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            throw error;
        }
    };

    // ===== INITIALIZATION =====

    const initializeDashboardData = useCallback(async (): Promise<void> => {
        try {
            await Promise.all([fetchAddresses(), fetchOrders()]);
        } catch (error) {
            console.error('Failed to initialize dashboard data:', error);
        }
    }, [fetchAddresses, fetchOrders]);

    // ===== CONTEXT VALUE =====

    const value: DashboardContextType = {
        // User profile state
        user,
        profileLoading,
        profileError,

        // Address state
        addresses,
        addressesLoading,
        addressesError,

        // Order state
        orders,
        ordersLoading,
        ordersError,

        // Profile actions
        updateProfile,
        changePassword,

        // Address actions
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setPrimaryAddress,

        // Order actions
        fetchOrders,

        // Utility methods
        clearErrors,
        refreshUserData,
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};
