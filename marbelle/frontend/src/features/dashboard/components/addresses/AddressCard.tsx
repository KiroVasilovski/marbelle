import React from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import type { Address } from '../../types/dashboard';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (address: Address) => void;
    onSetPrimary: (address: Address) => void;
    isPrimary: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetPrimary, isPrimary }) => {
    const { t } = useTranslation();

    const formatAddress = (): string => {
        const lines = [
            address.address_line_1,
            address.address_line_2,
            [address.city, address.state].filter(Boolean).join(', '),
            [address.postal_code, address.country].filter(Boolean).join(', '),
        ].filter(Boolean);

        return lines.join('\n');
    };

    const formatFullName = (): string => {
        return `${address.first_name} ${address.last_name}`.trim();
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date
            .toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            .toUpperCase();
    };

    return (
        <div
            className={`
            bg-white rounded border-2 p-6 transition-all duration-200
            ${isPrimary ? 'border-neutral-900 shadow-md' : 'border-neutral-200 hover:border-neutral-300'}
        `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div>
                        <h3 className="text-lg font-medium tracking-wide text-neutral-900">
                            {address.label.toUpperCase()}
                        </h3>
                        {isPrimary && (
                            <span className="text-xs bg-neutral-900 text-white px-2 py-1 rounded-full font-medium tracking-wide">
                                {t('dashboard.address.primaryLabel')}
                            </span>
                        )}
                    </div>
                </div>

                <Button variant="delete" size="sm" onClick={() => onDelete(address)}>
                    {t('common.deleteButton')}
                </Button>
            </div>

            {/* Address Information */}
            <div className="space-y-3">
                {/* Recipient */}
                <div>
                    <p className="text-sm font-medium text-neutral-900 tracking-wide">{formatFullName()}</p>
                    {address.company && <p className="text-sm text-neutral-600 tracking-wide">{address.company}</p>}
                </div>

                {/* Address */}
                <div>
                    <p className="text-sm text-neutral-700 tracking-wide leading-relaxed whitespace-pre-line">
                        {formatAddress()}
                    </p>
                </div>

                {/* Phone */}
                {address.phone && (
                    <div className="flex items-center space-x-2 ">
                        <Phone size={16} />
                        <p className="text-sm text-neutral-600 tracking-wide">{address.phone}</p>
                    </div>
                )}

                {/* Metadata */}
                <div className="pt-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between text-xs text-neutral-500 tracking-wide uppercase">
                        <span>
                            {t('dashboard.address.addedDate', {
                                date: formatDate(address.created_at),
                            })}
                        </span>
                        {address.updated_at !== address.created_at && (
                            <span>
                                {t('dashboard.address.updatedDate', {
                                    date: formatDate(address.updated_at),
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex justify-between">
                    {!isPrimary && (
                        <Button variant="secondary" size="sm" onClick={() => onSetPrimary(address)} className="text-xs">
                            {t('dashboard.address.setPrimaryButton')}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(address)}
                        className="text-neutral-600 hover:text-neutral-900"
                    >
                        {t('common.editButton')}
                    </Button>
                </div>
            </div>

            {/* Primary Address Info */}
            {isPrimary && (
                <div className="mt-3 bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 tracking-wide uppercase">
                        {t('dashboard.address.primaryAddressInfo')}
                    </p>
                </div>
            )}
        </div>
    );
};
