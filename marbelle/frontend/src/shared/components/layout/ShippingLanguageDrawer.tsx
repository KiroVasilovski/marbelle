import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '../shadcn/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '../shadcn/drawer';
import { Select } from '../ui/Select';
import type { SelectOption } from '../ui/Select';

interface ShippingLanguageSelectorProps {
    children: ReactNode;
    shippingLocation: string;
    onShippingLocationChange: (location: string) => void;
}

function ShippingLanguageDialog({
    children,
    shippingLocation,
    onShippingLocationChange,
}: ShippingLanguageSelectorProps) {
    const { i18n, t } = useTranslation();
    const [direction, setDirection] = useState<'bottom' | 'right'>('bottom');

    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth >= 1024) {
                setDirection('right');
            } else {
                setDirection('bottom');
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const shippingOptions: SelectOption[] = [
        { value: 'it', label: 'Italy' },
        { value: 'de', label: 'Germany' },
        { value: 'al', label: 'Albania' },
    ];

    const languageOptions: SelectOption[] = [
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Detusch' },
        { value: 'sq', label: 'Shqip' },
    ];

    return (
        <Drawer direction={direction}>
            {children}
            <DrawerContent>
                <div className={`px-10 pb-10 ${direction === 'right' ? 'flex flex-col h-full' : 'space-y-6'}`}>
                    <DrawerHeader className="px-0 pt-6">
                        <DrawerTitle className={`text-xl font-bold uppercase ${direction === 'right' && 'mt-20'} `}>
                            {t('shipping.drawer.title')}
                        </DrawerTitle>
                        <DrawerDescription></DrawerDescription>
                    </DrawerHeader>

                    <div
                        className={`flex-1 flex flex-col justify-center space-y-10 ${direction === 'right' && 'space-y-18'}`}
                    >
                        <div>
                            <Select
                                id="shipping-location"
                                options={shippingOptions}
                                value={shippingLocation}
                                onValueChange={onShippingLocationChange}
                                placeholder={t('shipping.drawer.shippingLocationPlaceholder')}
                                label={t('shipping.drawer.shippingLocationLabel').toUpperCase()}
                            />
                        </div>

                        <div>
                            <Select
                                id="language-select"
                                options={languageOptions}
                                value={i18n.language}
                                onValueChange={i18n.changeLanguage}
                                placeholder={t('shipping.drawer.languagePlaceholder')}
                                label={t('shipping.drawer.languageLabel').toUpperCase()}
                            />
                        </div>
                    </div>

                    <DrawerFooter className={`px-0 pb-0 ${direction === 'right' && 'mb-20'}`}>
                        <DrawerClose asChild>
                            <Button variant="secondary">{t('shipping.drawer.confirmButton').toUpperCase()}</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default ShippingLanguageDialog;
