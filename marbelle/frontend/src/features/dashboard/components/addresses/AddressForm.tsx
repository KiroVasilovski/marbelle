import React from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import { useDashboard } from '../../DashboardContext';
import type { Address } from '../../types/dashboard';
import { Select, type SelectOption } from '@/shared/components/ui/Select';
import { useFormValidation } from '../../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../../shared/lib/validation';
import { useTranslation } from 'react-i18next';

interface AddressFormProps {
    address?: Address | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const COUNTRIES: SelectOption[] = [
    { value: 'USA', label: 'USA' },
    { value: 'CANADA', label: 'CANADA' },
    { value: 'MEXICO', label: 'MEXICO' },
    { value: 'GERMANY', label: 'GERMANY' },
    { value: 'FRANCE', label: 'FRANCE' },
    { value: 'ITALY', label: 'ITALY' },
    { value: 'SPAIN', label: 'SPAIN' },
    { value: 'UK', label: 'UK' },
    { value: 'ALBANIA', label: 'ALBANIA' },
    { value: 'KOSOVO', label: 'KOSOVO' },
    { value: 'MONTENEGRO', label: 'MONTENEGRO' },
    { value: 'SERBIA', label: 'SERBIA' },
    { value: 'CROATIA', label: 'CROATIA' },
    { value: 'AUSTRIA', label: 'AUSTRIA' },
    { value: 'SWITZERLAND', label: 'SWITZERLAND' },
];

export const AddressForm: React.FC<AddressFormProps> = ({ address, onSuccess, onCancel }) => {
    const { createAddress, updateAddress, addressesLoading, addressesError } = useDashboard();
    const { t } = useTranslation();

    const getInitialValues = () => {
        if (address) {
            return {
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
            };
        }
        return {
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
        };
    };

    const validation = {
        label: [
            {
                validator: validationRules.required,
                message: t('validation.addressLabelRequired'),
            },
        ],
        first_name: [
            {
                validator: validationRules.required,
                message: t('validation.firstNameRequired'),
            },
        ],
        last_name: [
            {
                validator: validationRules.required,
                message: t('validation.lastNameRequired'),
            },
        ],
        address_line_1: [
            {
                validator: validationRules.required,
                message: t('validation.addressLine1Required'),
            },
        ],
        city: [
            {
                validator: validationRules.required,
                message: t('validation.cityRequired'),
            },
        ],
        state: [
            {
                validator: validationRules.required,
                message: t('validation.stateRequired'),
            },
        ],
        postal_code: [
            {
                validator: validationRules.required,
                message: t('validation.postalCodeRequired'),
            },
        ],
        country: [
            {
                validator: validationRules.required,
                message: t('validation.countryRequired'),
            },
        ],
        phone: [
            {
                validator: validationRules.phone,
                message: t('validation.validPhoneRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, canSubmit } = useFormValidation(
        getInitialValues(),
        validation
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) {
            return;
        }

        try {
            if (address) {
                await updateAddress(address.id, values);
            } else {
                await createAddress(values);
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
                        {t('dashboard.address.form.addressLabel')}
                    </h3>

                    <p className="text-neutral-500 text-xs mb-2 tracking-wide">
                        {t('dashboard.address.form.addressLabelDescription')}
                    </p>

                    <Input
                        id="label"
                        type="text"
                        label={t('dashboard.address.form.labelField')}
                        value={values.label}
                        onChange={(e) => setValue('label', e.target.value)}
                        onBlur={() => setTouched('label')}
                        error={errors.label && touched.label ? errors.label : undefined}
                        disabled={addressesLoading}
                    />
                </div>

                {/* Recipient Information */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                        {t('dashboard.address.form.recipientLabel')}
                    </h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                id="first_name"
                                type="text"
                                label={t('dashboard.address.form.firstName')}
                                value={values.first_name}
                                onChange={(e) => setValue('first_name', e.target.value)}
                                onBlur={() => setTouched('first_name')}
                                error={errors.first_name && touched.first_name ? errors.first_name : undefined}
                                disabled={addressesLoading}
                            />

                            <Input
                                id="last_name"
                                type="text"
                                label={t('dashboard.address.form.lastName')}
                                value={values.last_name}
                                onChange={(e) => setValue('last_name', e.target.value)}
                                onBlur={() => setTouched('last_name')}
                                error={errors.last_name && touched.last_name ? errors.last_name : undefined}
                                disabled={addressesLoading}
                            />
                        </div>

                        <div className="mt-4">
                            <Input
                                id="company"
                                type="text"
                                label={t('dashboard.address.form.companyName')}
                                value={values.company}
                                onChange={(e) => setValue('company', e.target.value)}
                                disabled={addressesLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                        {t('dashboard.address.form.addressInformation')}
                    </h3>

                    <div className="space-y-6">
                        <Input
                            id="address_line_1"
                            type="text"
                            label={t('dashboard.address.form.addressLine1')}
                            value={values.address_line_1}
                            onChange={(e) => setValue('address_line_1', e.target.value)}
                            onBlur={() => setTouched('address_line_1')}
                            error={errors.address_line_1 && touched.address_line_1 ? errors.address_line_1 : undefined}
                            disabled={addressesLoading}
                        />

                        <Input
                            id="address_line_2"
                            type="text"
                            label={t('dashboard.address.form.addressLine2')}
                            value={values.address_line_2}
                            onChange={(e) => setValue('address_line_2', e.target.value)}
                            disabled={addressesLoading}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <Input
                                id="city"
                                type="text"
                                label={t('dashboard.address.form.city')}
                                value={values.city}
                                onChange={(e) => setValue('city', e.target.value)}
                                onBlur={() => setTouched('city')}
                                error={errors.city && touched.city ? errors.city : undefined}
                                disabled={addressesLoading}
                            />

                            <Input
                                id="state"
                                type="text"
                                label={t('dashboard.address.form.state')}
                                value={values.state}
                                onChange={(e) => setValue('state', e.target.value)}
                                onBlur={() => setTouched('state')}
                                error={errors.state && touched.state ? errors.state : undefined}
                                disabled={addressesLoading}
                            />

                            <Input
                                id="postal_code"
                                type="text"
                                label={t('dashboard.address.form.zipCode')}
                                value={values.postal_code}
                                onChange={(e) => setValue('postal_code', e.target.value)}
                                onBlur={() => setTouched('postal_code')}
                                error={errors.postal_code && touched.postal_code ? errors.postal_code : undefined}
                                disabled={addressesLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Select
                                    id="country"
                                    options={COUNTRIES}
                                    value={values.country}
                                    onValueChange={(value) => setValue('country', value)}
                                    placeholder="Country"
                                    label="Country"
                                />
                                {errors.country && touched.country && (
                                    <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.country}</p>
                                )}
                            </div>

                            <Input
                                id="phone"
                                type="tel"
                                label={t('dashboard.address.form.phone')}
                                value={values.phone}
                                onChange={(e) => setValue('phone', e.target.value)}
                                onBlur={() => setTouched('phone')}
                                error={errors.phone && touched.phone ? errors.phone : undefined}
                                disabled={addressesLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <Button type="submit" variant="secondary" disabled={addressesLoading || !canSubmit}>
                        {addressesLoading
                            ? isEditing
                                ? t('dashboard.address.form.updateAddressButtonProgressing')
                                : t('dashboard.address.form.saveAddressButtonProgressing')
                            : isEditing
                              ? t('dashboard.address.form.updateAddressButton')
                              : t('dashboard.address.form.saveAddressButton')}
                    </Button>

                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={addressesLoading}>
                            {t('common.cancelButton')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};
