import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { useAuth } from '../AuthContext';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../shared/lib/validation';
import type { LoginCredentials } from '../types/auth';
import { Eye, EyeOff } from "lucide-react";

const initialValues = {
    email: '',
    password: '',
};

const validation = {
    email:
        [
            {
                validator: validationRules.required,
                message: 'EMAIL IS REQUIRED'
            },
            {
                validator: validationRules.email,
                message: 'VALID EMAIL IS REQUIRED'
            },
        ],
    password:
        [
            {
                validator: validationRules.required,
                message: 'PASSWORD IS REQUIRED'
            }
        ],
};

export const LoginForm: React.FC = () => {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
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
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 uppercase">SIGN IN</h2>
                <p className="text-gray-600 uppercase">ACCESS YOUR MARBELLE ACCOUNT</p>
            </div>

            {submitError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 uppercase">{submitError}</div>
            )}

            <div>
                <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setTouched('email')}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                    placeholder="Email Address"
                    autoComplete="email"
                />
                {errors.email && touched.email && <p className="text-red-500 text-xs mt-1 uppercase">{errors.email}</p>}
            </div>

            <div className="relative">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={(e) => setValue("password", e.target.value)}
                    onBlur={() => setTouched("password")}
                    className={
                        errors.password && touched.password
                            ? "border-red-500 pr-10"
                            : "pr-10"
                    }
                    placeholder="Password"
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
                    Forgot your password?
                </Link>
            </div>

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>

            <Button asChild className="w-full uppercase" variant="outline" disabled={isLoading}>
                <Link to="/register">CREATE ACCOUNT</Link>
            </Button>
        </form>
    );
};
