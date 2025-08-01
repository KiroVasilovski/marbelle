import React, { useState, useEffect } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { useDashboard } from '../../DashboardContext';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import type { Address } from '../../types/dashboard';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { DeleteConfirmModal } from '@/shared/components/ui/DeleteConfirmModal';
import { useTranslation } from 'react-i18next';

export const AddressesPage: React.FC = () => {
    const { t } = useTranslation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
    const { addresses, addressesLoading, addressesError, fetchAddresses, deleteAddress, setPrimaryAddress } =
        useDashboard();

    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleAddAddress = () => {
        setShowAddForm(true);
        setEditingAddress(null);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setShowAddForm(true);
    };

    const handleDeleteAddress = (address: Address) => {
        setDeletingAddress(address);
    };

    const handleSetPrimary = async (address: Address) => {
        if (!address.is_primary) {
            try {
                await setPrimaryAddress(address.id);
            } catch (error) {
                console.error('Failed to set primary address:', error);
            }
        }
    };

    const handleFormSuccess = () => {
        setShowAddForm(false);
        setEditingAddress(null);
        fetchAddresses();
    };

    const handleDeleteConfirm = async () => {
        if (deletingAddress) {
            try {
                await deleteAddress(deletingAddress.id);
                setDeletingAddress(null);
            } catch (error) {
                console.error('Failed to delete address:', error);
            }
        }
    };

    const canAddMoreAddresses = addresses.length < 10;
    const primaryAddress = addresses.find((addr) => addr.is_primary);

    if (showAddForm) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-light tracking-wider text-neutral-900">
                                {editingAddress ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
                            </h1>
                            <p className="text-neutral-600 tracking-wide mt-1">
                                {editingAddress
                                    ? 'Update your address details'
                                    : 'Add a new delivery or billing address'}
                            </p>
                        </div>
                    </div>
                </div>

                <AddressForm
                    address={editingAddress}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                        setShowAddForm(false);
                        setEditingAddress(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-light tracking-wider text-neutral-900 uppercase">
                            {t('dashboard.address.title')}
                        </h1>
                        <p className="text-neutral-600 tracking-wide mt-1">{t('dashboard.address.subtitle')}</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleAddAddress}
                        disabled={!canAddMoreAddresses || addressesLoading}
                    >
                        {t('dashboard.address.addAddressButton')}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {addressesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{addressesError}</p>
                </div>
            )}

            {/* Loading State */}
            {addressesLoading && (
                <div className="relative min-h-[300px] flex items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            )}

            {/* Empty State */}
            {!addressesLoading && addresses.length === 0 && (
                <div className="bg-white rounded border border-neutral-200 p-8 text-center">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2 tracking-wide uppercase">
                        {t('dashboard.address.emptyState.title')}
                    </h3>
                    <p className="text-neutral-600 mb-6 tracking-wide">{t('dashboard.address.emptyState.subtitle')}</p>
                    <Button variant="secondary" onClick={handleAddAddress}>
                        {t('dashboard.address.addAddressButton')}
                    </Button>
                </div>
            )}

            {/* Addresses Grid */}
            {!addressesLoading && addresses.length > 0 && (
                <div className="space-y-6">
                    {/* Primary Address Section */}
                    {primaryAddress && (
                        <div>
                            <h2 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                                {t('dashboard.address.primaryAddressLabel')}
                            </h2>
                            <AddressCard
                                address={primaryAddress}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                                onSetPrimary={handleSetPrimary}
                                isPrimary={true}
                            />
                        </div>
                    )}

                    {/* Other Addresses Section */}
                    {addresses.filter((addr) => !addr.is_primary).length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                                {t('dashboard.address.otherAddressesLabel')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses
                                    .filter((addr) => !addr.is_primary)
                                    .map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={handleEditAddress}
                                            onDelete={handleDeleteAddress}
                                            onSetPrimary={handleSetPrimary}
                                            isPrimary={false}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingAddress && (
                <DeleteConfirmModal
                    open={!!deletingAddress}
                    onOpenChange={(open) => !open && setDeletingAddress(null)}
                    title={t('dashboard.address.deleteAddressDialog.title', {
                        address: deletingAddress.label.toUpperCase(),
                    })}
                    description={t('dashboard.address.deleteAddressDialog.description')}
                    warning={
                        deletingAddress.is_primary
                            ? t('dashboard.address.deleteAddressDialog.primaryAddressWarning')
                            : undefined
                    }
                    destructiveWarning={t('dashboard.address.deleteAddressDialog.destructiveWarning')}
                    onConfirm={handleDeleteConfirm}
                    isLoading={addressesLoading}
                />
            )}
        </div>
    );
};
