import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { UnauthenticatedRoute } from './shared/components/ProtectedRoute';
import './i18n';
import Layout from './shared/components/layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import LoginPage from './features/auth/login/LoginPage';
import RegisterPage from './features/auth/register/RegisterPage';
import PasswordResetPage from './features/auth/password-reset/PasswordResetPage';
import EmailVerifyPage from './features/auth/register/EmailVerifyPage';

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

                    {/* Main layout routes - always accessible */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="products" element={<Products />} />
                        <Route path="about" element={<About />} />

                        {/* Protected routes - only accessible when logged in */}
                        {/* Example: */}
                        {/* <Route path="profile" element={
                            <AuthenticatedRoute>
                                <Profile />
                            </AuthenticatedRoute>
                        } /> */}
                        {/* <Route path="dashboard" element={
                            <AuthenticatedRoute>
                                <Dashboard />
                            </AuthenticatedRoute>
                        } /> */}
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
