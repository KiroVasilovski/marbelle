import React, { useState } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import {
    PasswordStrengthIndicator,
    PasswordMatchIndicator,
} from '../../../../shared/components/ui/password-strength-indicator';
import { useCompletePasswordValidation } from '../../../../shared/hooks/usePasswordValidation';
import { useFormValidation } from '../../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../../shared/lib/validation';
import { useDashboard } from '../../DashboardContext';
import type { PasswordChangeData } from '../../types/dashboard';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordPage: React.FC = () => {
    const { changePassword, profileLoading, profileError } = useDashboard();
    const { t } = useTranslation();

    const initialValues = {
        current_password: '',
        new_password: '',
        new_password_confirm: '',
    };

    const validation = {
        current_password: [
            {
                validator: validationRules.required,
                message: t('validation.currentPasswordRequired'),
            },
        ],
        new_password: [
            {
                validator: validationRules.required,
                message: t('validation.newPasswordRequired'),
            },
            {
                validator: validationRules.password,
                message: t('validation.passwordRequirements'),
            },
            {
                validator: validationRules.differentFromField('current_password'),
                message: t('validation.newPasswordDifferent'),
            },
        ],
        new_password_confirm: [
            {
                validator: validationRules.required,
                message: t('validation.passwordConfirmationRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, reset, canSubmit } = useFormValidation(
        initialValues,
        validation
    );

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [success, setSuccess] = useState(false);

    const {
        strength: passwordStrength,
        match: passwordMatch,
        isFormValid,
    } = useCompletePasswordValidation(values.new_password, values.new_password_confirm);

    const handleInputChange = (field: keyof PasswordChangeData, value: string) => {
        setValue(field, value);
        setSuccess(false);
    };

    const handleBlur = (field: keyof PasswordChangeData) => {
        setTouched(field);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll() || !isFormValid) {
            return;
        }

        try {
            await changePassword(values as PasswordChangeData);
            setSuccess(true);
            reset();
        } catch (error) {
            console.error('Password change failed:', error);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-light tracking-wider text-neutral-900 uppercase">
                    {t('dashboard.password.title')}
                </h1>
                <p className="text-neutral-600 tracking-wide mt-1">{t('dashboard.password.subtitle')}</p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className="text-green-800 text-sm tracking-wide font-medium uppercase">
                            {t('dashboard.password.success.title')}
                        </p>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {profileError && (
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{profileError}</p>
                </div>
            )}

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2 tracking-wide uppercase">
                    {t('dashboard.password.security.title')}
                </h3>
                <ul className="text-xs text-blue-800 space-y-1 tracking-wide">
                    <li>• {t('dashboard.password.security.first')}</li>
                    <li>• {t('dashboard.password.security.second')}</li>
                    <li>• {t('dashboard.password.security.third')}</li>
                    <li>• {t('dashboard.password.security.fourth')}</li>
                    <li>• {t('dashboard.password.security.fifth')}S</li>
                </ul>
            </div>

            {/* Form */}
            <div className="bg-white rounded border border-neutral-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showPasswords.current ? 'text' : 'password'}
                                label={t('dashboard.password.currentPassword')}
                                value={values.current_password}
                                onChange={(e) => handleInputChange('current_password', e.target.value)}
                                onBlur={() => handleBlur('current_password')}
                                error={
                                    errors.current_password && touched.current_password
                                        ? errors.current_password
                                        : undefined
                                }
                                disabled={profileLoading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <div className="relative">
                            <Input
                                id="new_password"
                                type={showPasswords.new ? 'text' : 'password'}
                                label={t('dashboard.password.newPassword')}
                                value={values.new_password}
                                onChange={(e) => handleInputChange('new_password', e.target.value)}
                                onBlur={() => handleBlur('new_password')}
                                error={errors.new_password && touched.new_password ? errors.new_password : undefined}
                                disabled={profileLoading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        <PasswordStrengthIndicator password={values.new_password} strength={passwordStrength} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <Input
                                id="new_password_confirm"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                label={t('dashboard.password.confirmPassword')}
                                value={values.new_password_confirm}
                                onChange={(e) => handleInputChange('new_password_confirm', e.target.value)}
                                onBlur={() => handleBlur('new_password_confirm')}
                                error={!passwordMatch.isMatch && passwordMatch.error ? passwordMatch.error : undefined}
                                disabled={profileLoading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        <PasswordMatchIndicator
                            password={values.new_password}
                            confirmPassword={values.new_password_confirm}
                            isMatch={passwordMatch.isMatch}
                            error={passwordMatch.error}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3">
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={profileLoading || !canSubmit || !isFormValid}
                            className="w-full md:w-auto min-w-[200px]"
                        >
                            {profileLoading
                                ? t('dashboard.password.changing').toUpperCase()
                                : t('dashboard.password.changeButton').toUpperCase()}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
