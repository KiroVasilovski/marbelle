import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { Input } from '../../../shared/components/ui/input';
import {
    PasswordStrengthIndicator,
    PasswordMatchIndicator,
} from '../../../shared/components/ui/password-strength-indicator';
import { AuthWindow } from '../ui/auth-window';
import { useAuth } from '../AuthContext';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { useCompletePasswordValidation } from '../../../shared/hooks/usePasswordValidation';
import { validationRules } from '../../../shared/lib/validation';
import { useTranslation } from 'react-i18next';
import type { RegisterData } from '../types/auth';
import { Eye, EyeOff } from 'lucide-react';
import { CheckMark } from '@/shared/components/ui/check-mark';

const initialValues = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    company_name: '',
    phone: '',
};

export const RegisterForm: React.FC = () => {
    const { register } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validation = {
        email: [
            {
                validator: validationRules.required,
                message: t('validation.emailRequired'),
            },
            {
                validator: validationRules.email,
                message: t('validation.validEmailRequired'),
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
        password: [
            {
                validator: validationRules.required,
                message: t('validation.passwordRequired'),
            },
            {
                validator: validationRules.password,
                message: t('validation.passwordRequirements'),
            },
        ],
        password_confirm: [
            {
                validator: validationRules.required,
                message: t('validation.passwordConfirmationRequired'),
            },
        ],
        phone: [
            {
                validator: validationRules.phone,
                message: t('validation.validPhoneRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, reset, canSubmit } = useFormValidation(
        initialValues,
        validation
    );

    // Use the enhanced password validation
    const {
        strength: passwordStrength,
        match: passwordMatch,
        isFormValid,
    } = useCompletePasswordValidation(values.password, values.password_confirm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        // For registration, we need both form validation AND password validation
        if (!validateAll() || !isFormValid) {
            return;
        }

        setIsLoading(true);
        try {
            await register(values as RegisterData);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : t('auth.errors.registrationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <AuthWindow
                title=""
                success={{
                    title: t('auth.register.successTitle'),
                    message: t('auth.register.successMessage'),
                    action: (
                        <>
                            <CheckMark />
                            <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                                {t('auth.register.goToLogin')}
                            </Button>
                        </>
                    ),
                }}
            />
        );
    }

    return (
        <AuthWindow
            title={t('auth.register.title')}
            subtitle={t('auth.register.subtitle')}
            error={submitError}
            isForm={true}
            onSubmit={handleSubmit}
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        id="first_name"
                        type="text"
                        label={t('auth.register.firstNamePlaceholder')}
                        value={values.first_name}
                        onChange={(e) => setValue('first_name', e.target.value)}
                        onBlur={() => setTouched('first_name')}
                        error={errors.first_name && touched.first_name ? errors.first_name : undefined}
                    />
                </div>

                <div>
                    <Input
                        id="last_name"
                        type="text"
                        label={t('auth.register.lastNamePlaceholder')}
                        value={values.last_name}
                        onChange={(e) => setValue('last_name', e.target.value)}
                        onBlur={() => setTouched('last_name')}
                        error={errors.last_name && touched.last_name ? errors.last_name : undefined}
                    />
                </div>
            </div>

            <Input
                id="email"
                type="email"
                label={t('auth.register.emailPlaceholder')}
                value={values.email}
                onChange={(e) => setValue('email', e.target.value)}
                onBlur={() => setTouched('email')}
                error={errors.email && touched.email ? errors.email : undefined}
            />

            <Input
                id="company_name"
                type="text"
                label={t('auth.register.companyPlaceholder')}
                value={values.company_name}
                onChange={(e) => setValue('company_name', e.target.value)}
            />

            <Input
                id="phone"
                type="tel"
                label={t('auth.register.phonePlaceholder')}
                value={values.phone}
                onChange={(e) => setValue('phone', e.target.value)}
                onBlur={() => setTouched('phone')}
                error={errors.phone && touched.phone ? errors.phone : undefined}
            />

            <div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        label={t('auth.register.passwordPlaceholder')}
                        value={values.password}
                        onChange={(e) => setValue('password', e.target.value)}
                        onBlur={() => setTouched('password')}
                        error={errors.password && touched.password ? errors.password : undefined}
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
                    password={values.password}
                    strength={passwordStrength}
                    showDetails={true}
                    className="mt-2"
                />
            </div>

            <div>
                <div className="relative">
                    <Input
                        id="password_confirm"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        label={t('auth.register.confirmPasswordPlaceholder')}
                        value={values.password_confirm}
                        onChange={(e) => setValue('password_confirm', e.target.value)}
                        onBlur={() => setTouched('password_confirm')}
                        error={!passwordMatch.isMatch && passwordMatch.error ? passwordMatch.error : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <PasswordMatchIndicator
                    password={values.password}
                    confirmPassword={values.password_confirm}
                    isMatch={passwordMatch.isMatch}
                    error={passwordMatch.error}
                />
            </div>

            <Button
                type="submit"
                className="w-full uppercase"
                variant="secondary"
                disabled={isLoading || !canSubmit || !isFormValid}
            >
                {isLoading ? t('auth.register.submitButtonLoading') : t('auth.register.submitButton')}
            </Button>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    {t('auth.register.alreadyRegistered')}{' '}
                    <Link to="/login" className="text-gray-600 hover:underline">
                        {t('auth.register.signIn')}
                    </Link>
                </p>
            </div>
        </AuthWindow>
    );
};
