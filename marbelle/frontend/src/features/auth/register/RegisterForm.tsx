import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { Input } from '../../../shared/components/ui/input';
import { AuthWindow } from '../ui/auth-window';
import { useAuth } from '../AuthContext';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules, getPasswordStrength } from '../../../shared/lib/validation';
import { useTranslation } from 'react-i18next';
import type { RegisterData } from '../types/auth';
import { Eye, EyeOff } from 'lucide-react';

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

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

    // Additional validation for password confirmation
    const passwordMatchError =
        values.password !== values.password_confirm && touched.password_confirm ? t('validation.passwordsNoMatch') : '';

    const passwordStrength = getPasswordStrength(values.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll() || passwordMatchError) {
            return;
        }

        setIsLoading(true);
        try {
            await register(values as RegisterData);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : t('errors.registrationFailed'));
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
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    ></path>
                                </svg>
                            </div>
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
                        value={values.first_name}
                        onChange={(e) => setValue('first_name', e.target.value)}
                        onBlur={() => setTouched('first_name')}
                        className={errors.first_name && touched.first_name ? 'border-red-500' : ''}
                        placeholder={t('auth.register.firstNamePlaceholder')}
                    />
                    {errors.first_name && touched.first_name && (
                        <p className="text-red-500 text-xs mt-1 uppercase">{errors.first_name}</p>
                    )}
                </div>

                <div>
                    <Input
                        id="last_name"
                        type="text"
                        value={values.last_name}
                        onChange={(e) => setValue('last_name', e.target.value)}
                        onBlur={() => setTouched('last_name')}
                        className={errors.last_name && touched.last_name ? 'border-red-500' : ''}
                        placeholder={t('auth.register.lastNamePlaceholder')}
                    />
                    {errors.last_name && touched.last_name && (
                        <p className="text-red-500 text-xs mt-1 uppercase">{errors.last_name}</p>
                    )}
                </div>
            </div>

            <div>
                <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setTouched('email')}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                    placeholder={t('auth.register.emailPlaceholder')}
                />
                {errors.email && touched.email && <p className="text-red-500 text-xs mt-1 uppercase">{errors.email}</p>}
            </div>

            <div>
                <Input
                    id="company_name"
                    type="text"
                    value={values.company_name}
                    onChange={(e) => setValue('company_name', e.target.value)}
                    placeholder={t('auth.register.companyPlaceholder')}
                />
            </div>

            <div>
                <Input
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => setValue('phone', e.target.value)}
                    onBlur={() => setTouched('phone')}
                    className={errors.phone && touched.phone ? 'border-red-500' : ''}
                    placeholder={t('auth.register.phonePlaceholder')}
                />
                {errors.phone && touched.phone && <p className="text-red-500 text-xs mt-1 uppercase">{errors.phone}</p>}
            </div>

            <div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={(e) => setValue('password', e.target.value)}
                        onBlur={() => setTouched('password')}
                        className={errors.password && touched.password ? 'border-red-500' : ''}
                        placeholder={t('auth.register.passwordPlaceholder')}
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
                {values.password && (
                    <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded ${
                                        i < passwordStrength.score ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                            <p className="text-xs text-gray-500 uppercase">
                                {t('auth.register.passwordStrengthNeeds')}: {passwordStrength.feedback.join(', ')}
                            </p>
                        )}
                    </div>
                )}
                {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1 uppercase">{errors.password}</p>
                )}
            </div>

            <div>
                <Input
                    id="password_confirm"
                    type="password"
                    value={values.password_confirm}
                    onChange={(e) => setValue('password_confirm', e.target.value)}
                    onBlur={() => setTouched('password_confirm')}
                    className={passwordMatchError ? 'border-red-500' : ''}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                />
                {passwordMatchError && <p className="text-red-500 text-xs mt-1 uppercase">{passwordMatchError}</p>}
            </div>

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
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
