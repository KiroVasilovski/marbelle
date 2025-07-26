import React from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import type { Address } from '../../types/dashboard';

interface DeleteAddressModalProps {
    address: Address;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const DeleteAddressModal: React.FC<DeleteAddressModalProps> = ({
    address,
    onConfirm,
    onCancel,
    isLoading,
}) => {
    const formatAddress = (): string => {
        const parts = [
            address.address_line_1,
            address.address_line_2,
            address.city,
            address.state,
            address.postal_code,
        ].filter(Boolean);
        
        return parts.join(', ');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-neutral-200 max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-xl font-medium tracking-wide text-neutral-900">
                        DELETE ADDRESS
                    </h2>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <p className="text-neutral-700 tracking-wide">
                        ARE YOU SURE YOU WANT TO DELETE THIS ADDRESS?
                    </p>

                    {/* Address Preview */}
                    <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-neutral-900 tracking-wide">
                                    {address.label.toUpperCase()}
                                </span>
                                {address.is_primary && (
                                    <span className="text-xs bg-neutral-900 text-white px-2 py-1 rounded-full font-medium tracking-wide">
                                        PRIMARY
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-sm text-neutral-700 tracking-wide">
                                {address.first_name} {address.last_name}
                            </p>
                            
                            {address.company && (
                                <p className="text-sm text-neutral-600 tracking-wide">
                                    {address.company}
                                </p>
                            )}
                            
                            <p className="text-sm text-neutral-600 tracking-wide">
                                {formatAddress()}
                            </p>
                        </div>
                    </div>

                    {/* Warning for primary address */}
                    {address.is_primary && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-yellow-800 text-sm tracking-wide">
                                ⚠️ THIS IS YOUR PRIMARY ADDRESS. YOU'LL NEED TO SET ANOTHER ADDRESS AS PRIMARY AFTER DELETION.
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-neutral-600 tracking-wide">
                        THIS ACTION CANNOT BE UNDONE.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        CANCEL
                    </Button>
                    
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="min-w-[100px]"
                    >
                        {isLoading ? 'DELETING...' : 'DELETE'}
                    </Button>
                </div>
            </div>
        </div>
    );
};