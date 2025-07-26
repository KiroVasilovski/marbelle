import React, { useState, useEffect } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import { useDashboard } from '../../DashboardContext';
import { dashboardService } from '../../services/dashboardService';
import type { Address, AddressFormData } from '../../types/dashboard';

interface AddressFormProps {
    address?: Address | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface FormErrors {
    [key: string]: string;
}

const COUNTRIES = [
    'USA', 'CANADA', 'MEXICO', 'GERMANY', 'FRANCE', 'ITALY', 'SPAIN', 'UK',
    'ALBANIA', 'KOSOVO', 'MONTENEGRO', 'SERBIA', 'CROATIA', 'AUSTRIA', 'SWITZERLAND'
];

export const AddressForm: React.FC<AddressFormProps> = ({ address, onSuccess, onCancel }) => {
    const { createAddress, updateAddress, addressesLoading, addressesError } = useDashboard();
    
    const [formData, setFormData] = useState<AddressFormData>({
        label: '',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'USA',
        phone: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    // Initialize form data when editing
    useEffect(() => {
        if (address) {
            setFormData({
                label: address.label || '',
                first_name: address.first_name || '',
                last_name: address.last_name || '',
                company: address.company || '',
                address_line_1: address.address_line_1 || '',
                address_line_2: address.address_line_2 || '',
                city: address.city || '',
                state: address.state || '',
                postal_code: address.postal_code || '',
                country: address.country || 'USA',
                phone: address.phone || '',
            });
        }
    }, [address]);

    const handleInputChange = (field: keyof AddressFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleBlur = (field: keyof AddressFormData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, formData[field]);
    };

    const validateField = (field: keyof AddressFormData, value: string | undefined) => {
        const newErrors = { ...errors };
        const val = value || '';

        switch (field) {
            case 'label':
                if (!val.trim()) {
                    newErrors.label = 'Address label is required';
                } else {
                    delete newErrors.label;
                }
                break;

            case 'first_name':
                if (!val.trim()) {
                    newErrors.first_name = 'First name is required';
                } else {
                    delete newErrors.first_name;
                }
                break;

            case 'last_name':
                if (!val.trim()) {
                    newErrors.last_name = 'Last name is required';
                } else {
                    delete newErrors.last_name;
                }
                break;

            case 'address_line_1':
                if (!val.trim()) {
                    newErrors.address_line_1 = 'Address line 1 is required';
                } else {
                    delete newErrors.address_line_1;
                }
                break;

            case 'city':
                if (!val.trim()) {
                    newErrors.city = 'City is required';
                } else {
                    delete newErrors.city;
                }
                break;

            case 'state':
                if (!val.trim()) {
                    newErrors.state = 'State is required';
                } else {
                    delete newErrors.state;
                }
                break;

            case 'postal_code':
                if (!val.trim()) {
                    newErrors.postal_code = 'Postal code is required';
                } else {
                    delete newErrors.postal_code;
                }
                break;

            case 'country':
                if (!val.trim()) {
                    newErrors.country = 'Country is required';
                } else {
                    delete newErrors.country;
                }
                break;

            case 'phone':
                if (val && val.trim()) {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(val.replace(/[\s\-\(\)]/g, ''))) {
                        newErrors.phone = 'Please enter a valid phone number';
                    } else {
                        delete newErrors.phone;
                    }
                } else {
                    delete newErrors.phone;
                }
                break;

            default:
                delete newErrors[field];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (): boolean => {
        const validationErrors = dashboardService.validateAddressData(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        setTouched(allTouched);

        if (!validateForm()) {
            return;
        }

        try {
            if (address) {
                await updateAddress(address.id, formData);
            } else {
                await createAddress(formData);
            }
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Address operation failed:', error);
        }
    };

    const isEditing = !!address;

    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Error Display */}
                {addressesError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm tracking-wide">{addressesError}</p>
                    </div>
                )}

                {/* Address Label */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                        ADDRESS DETAILS
                    </h3>
                    
                    <div>
                        <label htmlFor="label" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                            ADDRESS LABEL *
                        </label>
                        <Input
                            id="label"
                            type="text"
                            value={formData.label}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            onBlur={() => handleBlur('label')}
                            className={`${errors.label && touched.label ? 'border-red-500' : ''}`}
                            placeholder="E.G., HOME, OFFICE, WAREHOUSE"
                            disabled={addressesLoading}
                        />
                        {errors.label && touched.label && (
                            <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.label}</p>
                        )}
                        <p className="text-neutral-500 text-xs mt-1 tracking-wide">
                            GIVE THIS ADDRESS A NAME TO EASILY IDENTIFY IT
                        </p>
                    </div>
                </div>

                {/* Recipient Information */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                        RECIPIENT INFORMATION
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                FIRST NAME *
                            </label>
                            <Input
                                id="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                onBlur={() => handleBlur('first_name')}
                                className={`${errors.first_name && touched.first_name ? 'border-red-500' : ''}`}
                                placeholder="FIRST NAME"
                                disabled={addressesLoading}
                            />
                            {errors.first_name && touched.first_name && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.first_name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                LAST NAME *
                            </label>
                            <Input
                                id="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                onBlur={() => handleBlur('last_name')}
                                className={`${errors.last_name && touched.last_name ? 'border-red-500' : ''}`}
                                placeholder="LAST NAME"
                                disabled={addressesLoading}
                            />
                            {errors.last_name && touched.last_name && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.last_name}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                            COMPANY NAME
                        </label>
                        <Input
                            id="company"
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            onBlur={() => handleBlur('company')}
                            placeholder="COMPANY NAME (OPTIONAL)"
                            disabled={addressesLoading}
                        />
                    </div>
                </div>

                {/* Address Information */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                        ADDRESS INFORMATION
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="address_line_1" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                ADDRESS LINE 1 *
                            </label>
                            <Input
                                id="address_line_1"
                                type="text"
                                value={formData.address_line_1}
                                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                                onBlur={() => handleBlur('address_line_1')}
                                className={`${errors.address_line_1 && touched.address_line_1 ? 'border-red-500' : ''}`}
                                placeholder="STREET ADDRESS"
                                disabled={addressesLoading}
                            />
                            {errors.address_line_1 && touched.address_line_1 && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.address_line_1}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="address_line_2" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                ADDRESS LINE 2
                            </label>
                            <Input
                                id="address_line_2"
                                type="text"
                                value={formData.address_line_2}
                                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                                onBlur={() => handleBlur('address_line_2')}
                                placeholder="APARTMENT, SUITE, UNIT, ETC. (OPTIONAL)"
                                disabled={addressesLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                    CITY *
                                </label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    onBlur={() => handleBlur('city')}
                                    className={`${errors.city && touched.city ? 'border-red-500' : ''}`}
                                    placeholder="CITY"
                                    disabled={addressesLoading}
                                />
                                {errors.city && touched.city && (
                                    <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.city}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                    STATE / PROVINCE *
                                </label>
                                <Input
                                    id="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    onBlur={() => handleBlur('state')}
                                    className={`${errors.state && touched.state ? 'border-red-500' : ''}`}
                                    placeholder="STATE"
                                    disabled={addressesLoading}
                                />
                                {errors.state && touched.state && (
                                    <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.state}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="postal_code" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                    POSTAL CODE *
                                </label>
                                <Input
                                    id="postal_code"
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                    onBlur={() => handleBlur('postal_code')}
                                    className={`${errors.postal_code && touched.postal_code ? 'border-red-500' : ''}`}
                                    placeholder="ZIP / POSTAL CODE"
                                    disabled={addressesLoading}
                                />
                                {errors.postal_code && touched.postal_code && (
                                    <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.postal_code}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                    COUNTRY *
                                </label>
                                <select
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    onBlur={() => handleBlur('country')}
                                    className={`
                                        flex h-12 w-full border border-input px-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50
                                        ${errors.country && touched.country ? 'border-red-500' : ''}
                                    `}
                                    disabled={addressesLoading}
                                >
                                    {COUNTRIES.map(country => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && touched.country && (
                                    <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.country}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                                    PHONE NUMBER
                                </label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    onBlur={() => handleBlur('phone')}
                                    className={`${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                                    placeholder="PHONE NUMBER (OPTIONAL)"
                                    disabled={addressesLoading}
                                />
                                {errors.phone && touched.phone && (
                                    <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <Button
                        type="submit"
                        disabled={addressesLoading || Object.keys(errors).length > 0}
                        className="min-w-[150px]"
                    >
                        {addressesLoading 
                            ? (isEditing ? 'UPDATING...' : 'SAVING...') 
                            : (isEditing ? 'UPDATE ADDRESS' : 'SAVE ADDRESS')
                        }
                    </Button>

                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={addressesLoading}
                        >
                            CANCEL
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};