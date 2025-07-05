import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../../features/auth/AuthContext';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                            MARBELLE
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-gray-900 uppercase tracking-wide">
                            HOME
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-gray-900 uppercase tracking-wide">
                            PRODUCTS
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-gray-900 uppercase tracking-wide">
                            ABOUT
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="text-sm text-gray-700 uppercase">
                                    WELCOME, {user?.first_name}
                                    {user?.is_business_customer && (
                                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                                            BUSINESS
                                        </span>
                                    )}
                                </div>
                                <Button variant="outline" onClick={handleLogout} className="uppercase">
                                    LOGOUT
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="outline" className="uppercase">
                                        LOGIN
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="uppercase">REGISTER</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
