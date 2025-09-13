import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { Input } from '../../../shared/components/ui/input';
import { AuthWindow } from '../ui/auth-window';
import { useAuth } from '../AuthContext';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../shared/lib/validation';
import { useTranslation } from 'react-i18next';
import type { LoginCredentials } from '../types/auth';
import { Eye, EyeOff } from 'lucide-react';

const initialValues = {
    email: '',
    password: '',
};

export const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from?.pathname || '/';

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
        password: [
            {
                validator: validationRules.required,
                message: t('validation.passwordRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation(initialValues, validation);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll()) {
            return;
        }

        setIsLoading(true);
        try {
            await login(values as LoginCredentials);
            navigate(from, { replace: true });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : t('auth.errors.loginFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthWindow subtitle={t('auth.login.subtitle')} error={submitError} isForm={true} onSubmit={handleSubmit}>
            <Input
                id="email"
                type="email"
                label={t('auth.login.emailPlaceholder')}
                value={values.email}
                onChange={(e) => setValue('email', e.target.value)}
                onBlur={() => setTouched('email')}
                error={errors.email && touched.email ? errors.email : undefined}
                autoComplete="email"
            />

            <div className="relative">
                <Input
                    id="password"
                    label={t('auth.login.passwordPlaceholder')}
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(e) => setValue('password', e.target.value)}
                    onBlur={() => setTouched('password')}
                    error={errors.password && touched.password ? errors.password : undefined}
                    autoComplete="current-password"
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

            <div className="flex items-center">
                <Link to="/password-reset" className="text-sm text-gray-500 hover:underline">
                    {t('auth.login.forgotPassword')}
                </Link>
            </div>

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
                {isLoading ? t('auth.login.submitButtonLoading') : t('auth.login.submitButton')}
            </Button>

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">
                    {t('auth.login.loginDividerText')}
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button asChild className="w-full uppercase" variant="outline" disabled={isLoading}>
                <Link to="/register">{t('auth.login.createAccount')}</Link>
            </Button>
        </AuthWindow>
    );
};
