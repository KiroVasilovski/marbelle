import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import { useFormValidation } from '../../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../../shared/lib/validation';
import { dashboardService } from '../../services/dashboardService';
import type { EmailChangeRequestData } from '../../types/dashboard';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmailChangeFormProps {
    currentEmail: string;
    onSuccess: (message: string) => void;
}

export const EmailChangeForm: React.FC<EmailChangeFormProps> = ({ currentEmail, onSuccess }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialValues = useMemo(
        () => ({
            current_password: '',
            new_email: '',
        }),
        []
    );

    const validation = {
        current_password: [
            {
                validator: validationRules.required,
                message: t('validation.passwordRequired'),
            },
        ],
        new_email: [
            {
                validator: validationRules.required,
                message: t('validation.emailRequired'),
            },
            {
                validator: validationRules.email,
                message: t('validation.validEmailRequired'),
            },
            {
                validator: (value: string) => value.toLowerCase() !== currentEmail.toLowerCase(),
                message: t('validation.differentEmailRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, canSubmit } = useFormValidation(
        initialValues,
        validation
    );

    const handleInputChange = (field: keyof typeof initialValues, value: string) => {
        setValue(field, value);
        if (error) {
            setError(null);
        }
    };

    const handleBlur = (field: keyof typeof initialValues) => {
        setTouched(field);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateAll()) {
            return;
        }

        setIsLoading(true);

        try {
            await dashboardService.requestEmailChange(values as EmailChangeRequestData);

            onSuccess(t('dashboard.emailChange.form.successMessage'));
        } catch (error: any) {
            if (error.errors) {
                Object.entries(error.errors).forEach(([field, message]) => {
                    if (field && message) {
                        field === 'current_password' && setError(`${message}`);
                    }
                });
            } else {
                setError(error.message || 'Failed to request email change. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded border border-neutral-200 p-8">
            <div className="mb-6">
                <h2 className="text-lg font-medium tracking-wide text-neutral-900 uppercase mb-2">
                    {t('dashboard.emailChange.form.title')}
                </h2>
                <p className="text-neutral-600 text-sm tracking-wide">{t('dashboard.emailChange.form.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Security Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <div className="flex items-start space-x-3">
                        <TriangleAlert size={50} className="text-yellow-800 mt-1" />
                        <div>
                            <h4 className="font-medium text-yellow-800 uppercase tracking-wide text-sm">
                                {t('dashboard.emailChange.form.alert.title')}
                            </h4>
                            <p className="text-yellow-700 text-sm mt-1">
                                {t('dashboard.emailChange.form.alert.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Email Info */}
                <div className="bg-neutral-50 border border-neutral-200 rounded p-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                {t('dashboard.emailChange.form.currentEmail')}
                            </label>
                            <p className="text-neutral-900 mt-1 tracking-wide">{currentEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Current Password Field */}
                <div>
                    <Input
                        id="current_password"
                        type="password"
                        label={t('dashboard.emailChange.form.currentPassword')}
                        value={values.current_password}
                        onChange={(e) => handleInputChange('current_password', e.target.value)}
                        onBlur={() => handleBlur('current_password')}
                        error={
                            errors.current_password && touched.current_password ? errors.current_password : undefined
                        }
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    <p className="text-neutral-500 text-xs mt-1 tracking-wide">
                        {t('dashboard.emailChange.form.currentPasswordMessage')}
                    </p>
                </div>

                {/* New Email Field */}
                <div>
                    <Input
                        id="new_email"
                        type="email"
                        label={t('dashboard.emailChange.form.newEmailAddress')}
                        value={values.new_email}
                        onChange={(e) => handleInputChange('new_email', e.target.value)}
                        onBlur={() => handleBlur('new_email')}
                        error={errors.new_email && touched.new_email ? errors.new_email : undefined}
                        disabled={isLoading}
                        autoComplete="email"
                    />
                    <p className="text-neutral-500 text-xs mt-1 tracking-wide">
                        {t('dashboard.emailChange.form.newEmailAddressMessage')}
                    </p>
                </div>

                {/* Form Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-red-800 text-sm tracking-wide">{error}</p>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <Button type="submit" variant="secondary" disabled={isLoading || !canSubmit}>
                        {isLoading
                            ? t('dashboard.emailChange.form.sendButtonProgressing')
                            : t('dashboard.emailChange.form.sendButton')}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/dashboard/profile')}
                        disabled={isLoading}
                    >
                        {t('common.cancelButton')}
                    </Button>
                </div>
            </form>
        </div>
    );
};
