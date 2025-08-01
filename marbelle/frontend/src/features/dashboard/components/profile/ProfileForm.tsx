import React, { useMemo } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import { useDashboard } from '../../DashboardContext';
import { useFormValidation } from '../../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../../shared/lib/validation';
import type { User } from '../../../auth/types/auth';
import type { ProfileUpdateData } from '../../types/dashboard';
import { useTranslation } from 'react-i18next';

interface ProfileFormProps {
    user: User;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSuccess, onCancel }) => {
    const { updateProfile, profileLoading, profileError } = useDashboard();
    const { t } = useTranslation();

    const initialValues = useMemo(
        () => ({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            company_name: user.company_name || '',
        }),
        [user.first_name, user.last_name, user.phone, user.company_name]
    );

    const validation = {
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
        phone: [
            {
                validator: validationRules.optional(validationRules.phone),
                message: t('validation.validPhoneRequired'),
            },
        ],
        company_name: [],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, reset, canSubmit, canReset } =
        useFormValidation(initialValues, validation);

    const handleInputChange = (field: keyof typeof initialValues, value: string) => {
        setValue(field, value);
    };

    const handleBlur = (field: keyof typeof initialValues) => {
        setTouched(field);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) {
            return;
        }

        try {
            await updateProfile(values as ProfileUpdateData);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className="bg-white rounded border border-neutral-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Error Display */}
                {profileError && (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-red-800 text-sm tracking-wide">{profileError}</p>
                    </div>
                )}

                {/* Personal Information Section */}
                <div>
                    <h3 className="text-md font-medium tracking-wide text-neutral-900 mb-6 uppercase">
                        {t('dashboard.profile.form.personalInformation')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                id="first_name"
                                type="text"
                                label={t('dashboard.profile.form.firstName')}
                                value={values.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                onBlur={() => handleBlur('first_name')}
                                error={errors.first_name && touched.first_name ? errors.first_name : undefined}
                                disabled={profileLoading}
                            />
                        </div>

                        <div>
                            <Input
                                id="last_name"
                                type="text"
                                label={t('dashboard.profile.form.lastName')}
                                value={values.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                onBlur={() => handleBlur('last_name')}
                                error={errors.last_name && touched.last_name ? errors.last_name : undefined}
                                disabled={profileLoading}
                            />
                        </div>
                    </div>
                </div>
                {/* Contact Information Section */}
                <div>
                    <h3 className="text-md font-medium tracking-wide text-neutral-900 mb-6 uppercase">
                        {t('dashboard.profile.form.contactInformation')}
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <Input
                                id="phone"
                                type="tel"
                                label={t('dashboard.profile.form.phone')}
                                value={values.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                onBlur={() => handleBlur('phone')}
                                error={errors.phone && touched.phone ? errors.phone : undefined}
                                disabled={profileLoading}
                            />
                        </div>
                    </div>
                </div>
                {/* Business Information Section */}
                <div>
                    <h3 className="text-md font-medium tracking-wide text-neutral-900 mb-4 uppercase">
                        {t('dashboard.profile.form.businessInformation')}
                    </h3>

                    <div>
                        {!user.company_name && (
                            <p className="text-neutral-500 text-xs mt-1 mb-3 tracking-wide">
                                {t('dashboard.profile.form.companyMessage')}
                            </p>
                        )}
                        <Input
                            id="company_name"
                            type="text"
                            label={t('dashboard.profile.form.companyName')}
                            value={values.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            onBlur={() => handleBlur('company_name')}
                            disabled={profileLoading}
                        />
                    </div>
                </div>
                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <div className="flex space-x-6">
                        <Button type="submit" variant="secondary" disabled={profileLoading || !canSubmit}>
                            {profileLoading ? t('common.saveChangesButtonProgressing') : t('common.saveChangesButton')}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={profileLoading || !canReset}
                        >
                            {t('common.resetButton')}
                        </Button>
                    </div>

                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={profileLoading}>
                            {t('common.cancelButton')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};
