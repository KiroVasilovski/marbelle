import { Link } from 'react-router-dom';
import { Button } from '../shadcn/button';
import { useAuth } from '../../../features/auth/AuthContext';
import { useTranslation } from 'react-i18next';

function Header() {
    const { isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                            {t('header.brand')}
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-gray-900 uppercase tracking-wide">
                            {t('header.home')}
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-gray-900 uppercase tracking-wide">
                            {t('header.products')}
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-gray-900 uppercase tracking-wide">
                            {t('header.about')}
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard">
                                    <Button variant="ghost" className="uppercase">
                                        {t('header.myAccount')}
                                    </Button>
                                </Link>
                                <Button variant="outline" onClick={handleLogout} className="uppercase">
                                    {t('header.logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="outline" className="uppercase">
                                        {t('header.login')}
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="uppercase">{t('header.register')}</Button>
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
