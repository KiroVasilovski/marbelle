import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AuthHeader() {
    const location = useLocation();
    const { t } = useTranslation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/login':
                return t('auth.login.title');
            case '/register':
                return t('auth.register.title');
            case '/password-reset':
                return t('auth.passwordReset.title');
            case '/verify-email':
                return 'EMAIL VERIFICATION';
            default:
                return '';
        }
    };

    return (
        <>
            {/* Fixed transparent header with bottom border */}
            <header className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-sm">
                <div className="px-4 md:px-6 lg:px-8">
                    <div className="flex items-center h-16 md:h-20">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="text-3xl md:text-5xl font-light text-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                        >
                            MARBELLE
                        </Link>

                        {/* Divider */}
                        <div className="mx-4 md:mx-8 h-8 md:h-12 w-px bg-gray-300"></div>

                        {/* Current page title */}
                        <span className="text-sm md:text-lg font-light text-gray-600 uppercase tracking-wide">
                            {getPageTitle()}
                        </span>
                    </div>
                </div>
            </header>
        </>
    );
}

export default AuthHeader;
