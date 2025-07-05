import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
// import { ProtectedRoute } from './shared/components/ProtectedRoute';
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
                    {/* Public auth routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/password-reset" element={<PasswordResetPage />} />
                    <Route path="/verify-email" element={<EmailVerifyPage />} />

                    {/* Main layout routes */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="products" element={<Products />} />
                        <Route path="about" element={<About />} />

                        {/* Protected routes can be added here */}
                        {/* <Route path="dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } /> */}
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
