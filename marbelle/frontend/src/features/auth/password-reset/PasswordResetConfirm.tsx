import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { Input } from '../../../shared/components/ui/input';
import {
    PasswordStrengthIndicator,
    PasswordMatchIndicator,
} from '../../../shared/components/ui/password-strength-indicator';
import { AuthWindow } from '../ui/auth-window';
import { authService } from '../services/authService';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { useCompletePasswordValidation } from '../../../shared/hooks/usePasswordValidation';
import { validationRules } from '../../../shared/lib/validation';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const initialValues = {
    new_password: '',
    new_password_confirm: '',
};

export const PasswordResetConfirm: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    const token = searchParams.get('token');

    const validation = {
        new_password: [
            {
                validator: validationRules.required,
                message: t('validation.passwordRequired'),
            },
            {
                validator: validationRules.password,
                message: t('validation.passwordRequirements'),
            },
        ],
        new_password_confirm: [
            {
                validator: validationRules.required,
                message: t('validation.passwordConfirmationRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

    // Use the enhanced password validation
    const {
        strength: passwordStrength,
        match: passwordMatch,
        isFormValid,
    } = useCompletePasswordValidation(values.new_password, values.new_password_confirm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!token) {
            setSubmitError(t('auth.passwordReset.confirm.failure.invalidToken'));
            return;
        }

        if (!validateAll() || !isFormValid) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.confirmPasswordReset(token, values.new_password, values.new_password_confirm);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : t('auth.passwordReset.confirm.failure.title'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthWindow>
                <div className="text-center">
                    <p className="text-gray-600 mb-6 uppercase">{t('auth.passwordReset.confirm.failure.message')}</p>
                    <Link to="/password-reset">
                        <Button className="w-full uppercase">{t('auth.passwordReset.confirm.failure.action')}</Button>
                    </Link>
                </div>
            </AuthWindow>
        );
    }

    if (showSuccess) {
        return (
            <AuthWindow
                success={{
                    title: t('auth.passwordReset.confirm.success.title'),
                    message: t('auth.passwordReset.confirm.success.message'),
                    action: (
                        <Button onClick={() => navigate('/login')} variant="secondary" className="w-full uppercase">
                            {t('auth.passwordReset.confirm.success.goToLogin')}
                        </Button>
                    ),
                }}
            ></AuthWindow>
        );
    }

    return (
        <AuthWindow
            subtitle={t('auth.passwordReset.confirm.subtitle')}
            error={submitError}
            isForm={true}
            onSubmit={handleSubmit}
        >
            <div>
                <div className="relative">
                    <Input
                        id="new_password"
                        type={showPassword ? 'text' : 'password'}
                        label={t('auth.passwordReset.confirm.newPassword')}
                        value={values.new_password}
                        onChange={(e) => setValue('new_password', e.target.value)}
                        onBlur={() => setTouched('new_password')}
                        error={errors.new_password && touched.new_password ? errors.new_password : undefined}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <PasswordStrengthIndicator
                    password={values.new_password}
                    strength={passwordStrength}
                    showDetails={true}
                    className="mt-2"
                />
                {errors.new_password && touched.new_password && (
                    <p className="text-red-500 text-xs mt-1 uppercase">{errors.new_password}</p>
                )}
            </div>

            <div>
                <Input
                    id="new_password_confirm"
                    type="password"
                    label={t('auth.passwordReset.confirm.confirmPassword')}
                    value={values.new_password_confirm}
                    onChange={(e) => setValue('new_password_confirm', e.target.value)}
                    onBlur={() => setTouched('new_password_confirm')}
                    error={!passwordMatch.isMatch && passwordMatch.error ? passwordMatch.error : undefined}
                    autoComplete="new-password"
                />
                <PasswordMatchIndicator
                    password={values.new_password}
                    confirmPassword={values.new_password_confirm}
                    isMatch={passwordMatch.isMatch}
                    error={passwordMatch.error}
                />
            </div>

            <Button type="submit" variant="secondary" className="w-full uppercase" disabled={isLoading}>
                {isLoading
                    ? t('auth.passwordReset.confirm.submitButtonLoading')
                    : t('auth.passwordReset.confirm.submitButton')}
            </Button>

            <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full uppercase"
                disabled={isLoading}
            >
                {t('auth.common.cancelButton')}
            </Button>
        </AuthWindow>
    );
};
