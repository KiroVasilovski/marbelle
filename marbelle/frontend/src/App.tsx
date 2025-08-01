import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { UnauthenticatedRoute, AuthenticatedRoute } from './shared/components/ProtectedRoute';
import './i18n';
import Layout from './shared/components/layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import LoginPage from './features/auth/login/LoginPage';
import RegisterPage from './features/auth/register/RegisterPage';
import PasswordResetPage from './features/auth/password-reset/PasswordResetPage';
import EmailVerifyPage from './features/auth/register/EmailVerifyPage';

// Dashboard imports
import {
    DashboardProvider,
    DashboardLayout,
    DashboardPage,
    ProfilePage,
    AddressesPage,
    PasswordPage,
    OrdersPage,
} from './features/dashboard';

// Email change imports
import { EmailChangePage } from './features/dashboard/components/email-change/EmailChangePage';
import { EmailConfirmPage } from './features/dashboard/components/email-change/EmailConfirmPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Authentication routes - only accessible when NOT logged in */}
                    <Route
                        path="/login"
                        element={
                            <UnauthenticatedRoute>
                                <LoginPage />
                            </UnauthenticatedRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <UnauthenticatedRoute>
                                <RegisterPage />
                            </UnauthenticatedRoute>
                        }
                    />
                    <Route
                        path="/password-reset"
                        element={
                            <UnauthenticatedRoute>
                                <PasswordResetPage />
                            </UnauthenticatedRoute>
                        }
                    />
                    <Route
                        path="/verify-email"
                        element={
                            <UnauthenticatedRoute>
                                <EmailVerifyPage />
                            </UnauthenticatedRoute>
                        }
                    />

                    {/* Email change confirmation - public route but can be accessed by authenticated users */}
                    <Route path="/confirm-email-change" element={<EmailConfirmPage />} />

                    {/* Main layout routes - always accessible */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="products" element={<Products />} />
                        <Route path="about" element={<About />} />
                    </Route>

                    {/* Dashboard routes - protected and separate layout */}
                    <Route
                        path="/dashboard"
                        element={
                            <AuthenticatedRoute>
                                <DashboardProvider>
                                    <DashboardLayout />
                                </DashboardProvider>
                            </AuthenticatedRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="email-change" element={<EmailChangePage />} />
                        <Route path="addresses" element={<AddressesPage />} />
                        <Route path="password" element={<PasswordPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
