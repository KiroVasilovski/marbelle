import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../../../shared/components/shadcn/button';
import { useCart } from '../CartContext';
import { CartPreview } from './CartPreview';
import { CartHoverPreview } from './CartHoverPreview';

interface CartIconProps {
    variant?: 'desktop' | 'mobile';
    className?: string;
}

export const CartIcon: React.FC<CartIconProps> = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { cart, recentlyAddedItem, showCartPreview, closeCartPreview } = useCart();
    const [showHoverPreview, setShowHoverPreview] = useState(false);

    const itemCount = cart?.item_count || 0;
    const isOnCartPage = location.pathname === '/cart';

    const handleMouseEnter = () => {
        if (!isOnCartPage) {
            setShowHoverPreview(true);
        }
    };

    const handleMouseLeave = () => {
        setShowHoverPreview(false);
    };

    return (
        <div className="relative">
            {/* Desktop with hover */}
            <div className="hidden md:block relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Link to="/cart">
                    <Button variant="ghost" className="font-light tracking-wide uppercase">
                        {t('header.shoppingCart')} [{itemCount}]
                    </Button>
                </Link>

                {/* Hover Preview - Desktop only */}
                {showHoverPreview && !showCartPreview && (
                    <CartHoverPreview cart={cart} isVisible={showHoverPreview && !showCartPreview} />
                )}
            </div>

            {/* Mobile - no hover preview */}
            <Link to="/cart" className="md:hidden">
                <Button variant="ghost" className="px-2">
                    {itemCount === 0 ? (
                        <ShoppingCart strokeWidth={1.5} size={24} />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-shopping-cart-open lucide-shopping-cart"
                        >
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43" />
                        </svg>
                    )}
                    {itemCount > 0 && (
                        <span className="absolute top-[8px] left-1/2 -translate-x-1/2 ml-[1px] text-black text-xs font-medium tabular-nums">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </Link>

            {/* Cart Preview Dropdown */}
            <CartPreview
                isOpen={showCartPreview}
                onClose={closeCartPreview}
                recentlyAddedItem={recentlyAddedItem}
                cartItemCount={itemCount}
                cartTotal={cart?.total || '0.00'}
            />
        </div>
    );
};
