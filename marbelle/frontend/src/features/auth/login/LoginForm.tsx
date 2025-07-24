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
            setSubmitError(error instanceof Error ? error.message : t('errors.loginFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthWindow
            title={t('auth.login.title')}
            subtitle={t('auth.login.subtitle')}
            error={submitError}
            isForm={true}
            onSubmit={handleSubmit}
        >
            <div>
                <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setTouched('email')}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                    placeholder={t('auth.login.emailPlaceholder')}
                    autoComplete="email"
                />
                {errors.email && touched.email && <p className="text-red-500 text-xs mt-1 uppercase">{errors.email}</p>}
            </div>

            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(e) => setValue('password', e.target.value)}
                    onBlur={() => setTouched('password')}
                    className={errors.password && touched.password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder={t('auth.login.passwordPlaceholder')}
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
                {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1 uppercase">{errors.password}</p>
                )}
            </div>

            <div className="flex items-center">
                <Link to="/password-reset" className="text-sm text-gray-500 hover:underline">
                    {t('auth.login.forgotPassword')}
                </Link>
            </div>

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
                {isLoading ? t('auth.login.submitButtonLoading') : t('auth.login.submitButton')}
            </Button>

            <Button asChild className="w-full uppercase" variant="outline" disabled={isLoading}>
                <Link to="/register">{t('auth.login.createAccount')}</Link>
            </Button>
        </AuthWindow>
    );
};
