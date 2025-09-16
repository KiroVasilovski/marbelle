import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';

interface CartIconProps {
    variant?: 'desktop' | 'mobile';
    className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ variant = 'desktop' }) => {
    const { t } = useTranslation();
    const { cart } = useCart();

    const itemCount = cart?.item_count || 0;

    if (variant === 'desktop') {
        return (
            <Link to="/cart">
                <Button
                    variant="ghost"
                    className="hidden md:flex items-center space-x-2 text-black font-light tracking-wide uppercase px-3 h-auto py-2"
                >
                    <span>
                        {t('header.shoppingCart')} [{itemCount}]
                    </span>
                </Button>
            </Link>
        );
    }

    return (
        <Link to="/cart">
            <Button variant="ghost" className="md:hidden p-2 text-black relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                    <span className="absolute -top-0 -right-0 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Button>
        </Link>
    );
};
