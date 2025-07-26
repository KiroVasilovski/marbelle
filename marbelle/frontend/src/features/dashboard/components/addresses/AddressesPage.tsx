import React, { useState, useEffect } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { useDashboard } from '../../DashboardContext';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { DeleteAddressModal } from './DeleteAddressModal';
import type { Address } from '../../types/dashboard';

export const AddressesPage: React.FC = () => {
    const {
        addresses,
        addressesLoading,
        addressesError,
        fetchAddresses,
        deleteAddress,
        setPrimaryAddress,
    } = useDashboard();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

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
        fetchAddresses(); // Refresh the list
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
    const primaryAddress = addresses.find(addr => addr.is_primary);

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
                                    ? 'UPDATE YOUR ADDRESS INFORMATION'
                                    : 'ADD A NEW DELIVERY OR BILLING ADDRESS'
                                }
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingAddress(null);
                            }}
                        >
                            CANCEL
                        </Button>
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
                        <h1 className="text-2xl font-light tracking-wider text-neutral-900">
                            YOUR ADDRESSES
                        </h1>
                        <p className="text-neutral-600 tracking-wide mt-1">
                            MANAGE YOUR DELIVERY AND BILLING ADDRESSES
                        </p>
                    </div>
                    <Button
                        onClick={handleAddAddress}
                        disabled={!canAddMoreAddresses || addressesLoading}
                    >
                        ADD ADDRESS
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {addressesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{addressesError}</p>
                </div>
            )}

            {/* Address Limit Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-800 text-sm font-medium tracking-wide">
                            ADDRESS LIMIT: {addresses.length} / 10
                        </p>
                        <p className="text-blue-600 text-xs mt-1 tracking-wide">
                            {canAddMoreAddresses 
                                ? `YOU CAN ADD ${10 - addresses.length} MORE ADDRESS${10 - addresses.length !== 1 ? 'ES' : ''}`
                                : 'YOU HAVE REACHED THE MAXIMUM NUMBER OF ADDRESSES'
                            }
                        </p>
                    </div>
                    {!canAddMoreAddresses && (
                        <span className="text-blue-600 text-lg">⚠️</span>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {addressesLoading && (
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                    <p className="text-neutral-600 tracking-wide">LOADING ADDRESSES...</p>
                </div>
            )}

            {/* Empty State */}
            {!addressesLoading && addresses.length === 0 && (
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                    <span className="text-6xl mb-4 block">📍</span>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2 tracking-wide">
                        NO ADDRESSES FOUND
                    </h3>
                    <p className="text-neutral-600 mb-6 tracking-wide">
                        ADD YOUR FIRST ADDRESS TO GET STARTED WITH ORDERS
                    </p>
                    <Button onClick={handleAddAddress}>
                        ADD YOUR FIRST ADDRESS
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
                                PRIMARY ADDRESS
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
                    {addresses.filter(addr => !addr.is_primary).length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                                OTHER ADDRESSES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses
                                    .filter(addr => !addr.is_primary)
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
                <DeleteAddressModal
                    address={deletingAddress}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeletingAddress(null)}
                    isLoading={addressesLoading}
                />
            )}
        </div>
    );
};