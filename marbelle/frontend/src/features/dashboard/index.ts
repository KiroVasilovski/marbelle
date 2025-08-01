/**
 * Dashboard feature exports
 */

// Context
export { DashboardProvider, useDashboard } from './DashboardContext';

// Components
export { DashboardLayout } from './components/DashboardLayout';
export { DashboardPage } from './components/DashboardPage';

// Profile components
export { ProfilePage } from './components/profile/ProfilePage';
export { ProfileForm } from './components/profile/ProfileForm';

// Address components
export { AddressesPage } from './components/addresses/AddressesPage';
export { AddressCard } from './components/addresses/AddressCard';
export { AddressForm } from './components/addresses/AddressForm';

// Password components
export { PasswordPage } from './components/password/PasswordPage';

// Orders components
export { OrdersPage } from './components/orders/OrdersPage';

// Services
export { dashboardService } from './services/dashboardService';

// Types
export type {
    Address,
    AddressFormData,
    ProfileUpdateData,
    PasswordChangeData,
    Order,
    DashboardContextType,
    ApiResponse,
    AddressResponse,
    ProfileResponse,
    OrderHistoryResponse,
} from './types/dashboard';
export type { User } from '../auth/types/auth';
