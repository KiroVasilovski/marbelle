import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { useAuth } from '../AuthContext';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../shared/lib/validation';
import type { LoginCredentials } from '../types/auth';

const initialValues = {
    email: '',
    password: '',
};

const validation = {
    email: [
        { validator: validationRules.required, message: 'EMAIL IS REQUIRED' },
        { validator: validationRules.email, message: 'VALID EMAIL IS REQUIRED' },
    ],
    password: [{ validator: validationRules.required, message: 'PASSWORD IS REQUIRED' }],
};

export const LoginForm: React.FC = () => {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitError, setSubmitError] = useState<string>('');

    const from = location.state?.from?.pathname || '/';

    const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation(initialValues, validation);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll()) {
            return;
        }

        try {
            await login(values as LoginCredentials);
            navigate(from, { replace: true });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'LOGIN FAILED');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 uppercase">SIGN IN</h2>
                <p className="text-gray-600 uppercase">ACCESS YOUR MARBELLE ACCOUNT</p>
            </div>

            {submitError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded uppercase">{submitError}</div>
            )}

            <div>
                <Label htmlFor="email">EMAIL ADDRESS</Label>
                <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setTouched('email')}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                    placeholder="YOUR@EMAIL.COM"
                    autoComplete="email"
                />
                {errors.email && touched.email && <p className="text-red-500 text-xs mt-1 uppercase">{errors.email}</p>}
            </div>

            <div>
                <Label htmlFor="password">PASSWORD</Label>
                <Input
                    id="password"
                    type="password"
                    value={values.password}
                    onChange={(e) => setValue('password', e.target.value)}
                    onBlur={() => setTouched('password')}
                    className={errors.password && touched.password ? 'border-red-500' : ''}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1 uppercase">{errors.password}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div></div>
                <Link to="/password-reset" className="text-sm text-blue-600 hover:underline uppercase">
                    FORGOT PASSWORD?
                </Link>
            </div>

            <Button type="submit" className="w-full uppercase" variant="outline" disabled={isLoading}>
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>

            <div className="text-center">
                <p className="text-sm text-gray-600 uppercase">
                    DON&apos;T HAVE AN ACCOUNT?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline uppercase">
                        CREATE ACCOUNT
                    </Link>
                </p>
            </div>
        </form>
    );
};
