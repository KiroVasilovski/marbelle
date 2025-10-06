import { Link } from 'react-router-dom';
import { Button } from '../shadcn/button';
import { useAuth } from '../../../features/auth/AuthContext';
import { CartIcon } from '../../../features/cart';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { User, HelpCircle } from 'lucide-react';
import { Drawer, DrawerTrigger } from '../shadcn/drawer';

interface HeaderProps {
    isProductDetailPage?: boolean;
}

function Header({ isProductDetailPage = false }: HeaderProps) {
    const { isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Track scroll direction for mobile transparency
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setScrollDirection('down');
            } else if (currentScrollY < lastScrollY) {
                setScrollDirection('up');
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Disable body scrolling when drawer is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    return (
        <>
            {/* Fixed transparent header */}
            <header
                className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
                    // When drawer is open: always show background
                    isMenuOpen
                        ? 'bg-white/95 backdrop-blur-sm'
                        : // When drawer is closed: normal behavior
                          // Desktop: show background on hover, Mobile: show background when scrolling up
                          'bg-transparent hover:bg-white/90 md:hover:backdrop-blur-sm'
                } ${
                    // Mobile only: add background when scrolling up (only if drawer is closed)
                    !isMenuOpen && scrollDirection === 'up'
                        ? 'bg-white/90 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none'
                        : ''
                }`}
            >
                <div className="px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 md:h-20">
                        {/* Left side: Burger Menu */}
                        <div className="flex items-center">
                            <Drawer direction="left" open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                <DrawerTrigger asChild>
                                    <button
                                        className="p-1 md:p-2 mr-4 hover:bg-black/5 rounded-sm transition-colors duration-200"
                                        aria-label="Toggle menu"
                                    >
                                        <div className="relative w-6 h-6 md:w-12 md:h-12">
                                            <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                                <div
                                                    className={`w-6 h-6 flex flex-col justify-center items-center space-y-1 md:space-y-2 transition-all duration-300 ${
                                                        isMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                                                    }`}
                                                >
                                                    <div className="w-5 md:w-10 h-px bg-black"></div>
                                                    <div className="w-5 md:w-10 h-px bg-black"></div>
                                                    <div className="w-5 md:w-10 h-px bg-black"></div>
                                                </div>
                                                <div
                                                    className={`w-6 h-6 flex items-center justify-center absolute transition-all duration-300 ${
                                                        isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                                                    }`}
                                                >
                                                    <div className="relative w-6 h-6">
                                                        <div className="absolute top-1/2 left-1/2 w-5 md:w-10 h-px bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                                        <div className="absolute top-1/2 left-1/2 w-5 md:w-10 h-px bg-black transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </DrawerTrigger>
                            </Drawer>

                            {/* Logo - Hidden on product detail pages */}
                            {!isProductDetailPage && (
                                <Link
                                    to="/"
                                    className="text-2xl sm:text-3xl md:text-5xl font-light text-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                                    onClick={closeMenu}
                                >
                                    MARBELLE
                                </Link>
                            )}
                        </div>

                        {/* Right side: Account, Help, Cart */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* My Account / Login */}
                            {isAuthenticated ? (
                                <Link to="/dashboard" onClick={closeMenu}>
                                    <Button
                                        variant="ghost"
                                        className="hidden md:flex font-light tracking-wide uppercase"
                                    >
                                        {t('header.myAccount')}
                                    </Button>
                                    <Button variant="ghost" className="md:hidden px-2">
                                        <User size={20} />
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/login" onClick={closeMenu}>
                                    <Button
                                        variant="ghost"
                                        className="hidden md:flex font-light tracking-wide uppercase"
                                    >
                                        {t('header.login')}
                                    </Button>
                                    <Button variant="ghost" className="md:hidden px-2">
                                        <User strokeWidth={1.5} size={24} />
                                    </Button>
                                </Link>
                            )}

                            {/* Help */}
                            <Button variant="ghost" className="hidden md:flex font-light tracking-wide uppercase">
                                {t('header.help')}
                            </Button>
                            <Button variant="ghost" className="md:hidden px-2">
                                <HelpCircle strokeWidth={1.5} size={24} />
                            </Button>

                            {/* Shopping Cart */}
                            <CartIcon />
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Drawer Implementation */}
            {isMenuOpen && (
                <>
                    {/* Overlay that doesn't cover header */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm top-12 md:top-20"
                        onClick={closeMenu}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                closeMenu();
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Close menu"
                    />

                    {/* Drawer Content */}
                    <div
                        className={`fixed left-0 z-150 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
                                   w-full md:w-80 border-r border-gray-200 top-12 md:top-20 bottom-0
                                   ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        <div className="p-6">
                            {/* Navigation Links */}
                            <nav className="space-y-6">
                                <Link
                                    to="/"
                                    className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide"
                                    onClick={closeMenu}
                                >
                                    {t('header.home')}
                                </Link>
                                <Link
                                    to="/products"
                                    className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide"
                                    onClick={closeMenu}
                                >
                                    {t('header.products')}
                                </Link>
                                <Link
                                    to="/about"
                                    className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide"
                                    onClick={closeMenu}
                                >
                                    {t('header.about')}
                                </Link>
                            </nav>

                            {/* Account Section */}
                            <div className="mt-12 pt-6 border-t border-gray-200">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        <Link
                                            to="/dashboard"
                                            className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide"
                                            onClick={closeMenu}
                                        >
                                            {t('header.myAccount')}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide text-left"
                                        >
                                            {t('header.logout')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Link
                                            to="/login"
                                            className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide"
                                            onClick={closeMenu}
                                        >
                                            {t('header.login')}
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block text-lg font-light text-black hover:opacity-70 transition-opacity uppercase tracking-wide"
                                            onClick={closeMenu}
                                        >
                                            {t('header.register')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Spacer for fixed header */}
            <div className="h-12 md:h-20" />
        </>
    );
}

export default Header;
