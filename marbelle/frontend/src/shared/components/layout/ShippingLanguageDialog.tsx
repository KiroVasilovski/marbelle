import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Button } from '../shadcn/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../shadcn/dialog';
import { Select } from '../ui/Select';
import type { SelectOption } from '../ui/Select';

interface ShippingLanguageDialogProps {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shippingLocation: string;
    onShippingLocationChange: (location: string) => void;
}

function ShippingLanguageDialog({
    children,
    open,
    onOpenChange,
    shippingLocation,
    onShippingLocationChange,
}: ShippingLanguageDialogProps) {
    const { i18n, t } = useTranslation();

    const shippingOptions: SelectOption[] = [
        { value: 'it', label: 'Italy' },
        { value: 'de', label: 'Germany' },
        { value: 'al', label: 'Albania' },
    ];

    const languageOptions: SelectOption[] = [
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' },
        { value: 'sq', label: 'Shqip' },
    ];

    const handleConfirm = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase text-neutral-900 tracking-wide">
                        {t('shipping.drawer.title')}
                    </DialogTitle>
                    <DialogDescription>{/* Empty description for accessibility */}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
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

                <DialogFooter>
                    <Button variant="secondary" onClick={handleConfirm} className="w-full">
                        {t('shipping.drawer.confirmButton').toUpperCase()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ShippingLanguageDialog;
