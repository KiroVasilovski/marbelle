import React from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import type { Address } from '../../types/dashboard';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (address: Address) => void;
    onSetPrimary: (address: Address) => void;
    isPrimary: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
    address,
    onEdit,
    onDelete,
    onSetPrimary,
    isPrimary,
}) => {
    const formatAddress = (): string => {
        const parts = [
            address.address_line_1,
            address.address_line_2,
            address.city,
            address.state,
            address.postal_code,
            address.country,
        ].filter(Boolean);
        
        return parts.join(', ');
    };

    const formatFullName = (): string => {
        return `${address.first_name} ${address.last_name}`.trim();
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).toUpperCase();
    };

    return (
        <div className={`
            bg-white rounded-lg border-2 p-6 transition-all duration-200
            ${isPrimary 
                ? 'border-neutral-900 shadow-md' 
                : 'border-neutral-200 hover:border-neutral-300'
            }
        `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <span className="text-xl">{isPrimary ? '⭐' : '📍'}</span>
                    <div>
                        <h3 className="text-lg font-medium tracking-wide text-neutral-900">
                            {address.label.toUpperCase()}
                        </h3>
                        {isPrimary && (
                            <span className="text-xs bg-neutral-900 text-white px-2 py-1 rounded-full font-medium tracking-wide">
                                PRIMARY
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(address)}
                        className="text-neutral-600 hover:text-neutral-900"
                    >
                        EDIT
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(address)}
                        className="text-red-600 hover:text-red-800"
                    >
                        DELETE
                    </Button>
                </div>
            </div>

            {/* Address Information */}
            <div className="space-y-3">
                {/* Recipient */}
                <div>
                    <p className="text-sm font-medium text-neutral-900 tracking-wide">
                        {formatFullName()}
                    </p>
                    {address.company && (
                        <p className="text-sm text-neutral-600 tracking-wide">
                            {address.company}
                        </p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <p className="text-sm text-neutral-700 tracking-wide leading-relaxed">
                        {formatAddress()}
                    </p>
                </div>

                {/* Phone */}
                {address.phone && (
                    <div>
                        <p className="text-sm text-neutral-600 tracking-wide">
                            📞 {address.phone}
                        </p>
                    </div>
                )}

                {/* Metadata */}
                <div className="pt-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between text-xs text-neutral-500 tracking-wide">
                        <span>ADDED: {formatDate(address.created_at)}</span>
                        {address.updated_at !== address.created_at && (
                            <span>UPDATED: {formatDate(address.updated_at)}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                        {!isPrimary && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSetPrimary(address)}
                                className="text-xs"
                            >
                                SET AS PRIMARY
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(address)}
                            className="text-xs text-neutral-600"
                        >
                            ✏️ EDIT
                        </Button>
                    </div>
                </div>
            </div>

            {/* Primary Address Info */}
            {isPrimary && (
                <div className="mt-3 bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 tracking-wide">
                        ⭐ THIS IS YOUR PRIMARY ADDRESS. IT WILL BE USED AS THE DEFAULT FOR ORDERS AND BILLING.
                    </p>
                </div>
            )}
        </div>
    );
};