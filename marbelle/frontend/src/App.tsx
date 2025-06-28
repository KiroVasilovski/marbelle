import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
// import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import About from '@/pages/About';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import PasswordResetPage from '@/pages/auth/PasswordResetPage';
import EmailVerifyPage from '@/pages/auth/EmailVerifyPage';

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