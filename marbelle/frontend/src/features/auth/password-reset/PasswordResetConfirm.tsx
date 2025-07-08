import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { authService } from '../services/authService';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules, getPasswordStrength } from '../../../shared/lib/validation';
import { Eye, EyeOff } from "lucide-react";

const initialValues = {
    new_password: '',
    new_password_confirm: '',
};

const validation = {
    new_password:
        [
            {
                validator: validationRules.required,
                message: 'PASSWORD IS REQUIRED'
            },
            {
                validator: validationRules.password,
                message: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS WITH MIXED CASE AND NUMBERS',
            },
        ],
    new_password_confirm:
        [
            {
                validator: validationRules.required,
                message: 'PASSWORD CONFIRMATION IS REQUIRED'
            }
        ],
};

export const PasswordResetConfirm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    const token = searchParams.get('token');

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

    // Additional validation for password confirmation
    const passwordMatchError =
        values.new_password !== values.new_password_confirm && touched.new_password_confirm
            ? 'PASSWORDS DO NOT MATCH'
            : '';

    const passwordStrength = getPasswordStrength(values.new_password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!token) {
            setSubmitError('INVALID RESET TOKEN');
            return;
        }

        if (!validateAll() || passwordMatchError) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.confirmPasswordReset(token, values.new_password, values.new_password_confirm);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'PASSWORD RESET FAILED');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 uppercase text-red-600">INVALID RESET LINK</h2>
                    <p className="text-gray-600 mb-6 uppercase">THIS PASSWORD RESET LINK IS INVALID OR HAS EXPIRED</p>
                    <Link to="/password-reset">
                        <Button className="w-full uppercase">REQUEST NEW RESET LINK</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 uppercase text-green-600">PASSWORD RESET SUCCESSFUL</h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been successfully reset. You can now sign in with your new password.
                    </p>
                    <Button onClick={() => navigate('/login')} variant="secondary" className="w-full uppercase">
                        SIGN IN
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 uppercase">SET NEW PASSWORD</h2>
                <p className="text-gray-600">Please enter your new password below.</p>
            </div>

            {submitError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded uppercase">{submitError}</div>
            )}

            <div>
                <div className="relative">
                    <Input
                        id="new_password"
                        type={showPassword ? "text" : "password"}
                        value={values.new_password}
                        onChange={(e) => setValue('new_password', e.target.value)}
                        onBlur={() => setTouched('new_password')}
                        className={errors.new_password && touched.new_password ? 'border-red-500' : ''}
                        placeholder="Password"
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
                {values.new_password && (
                    <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded ${i < passwordStrength.score ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                            <p className="text-xs text-gray-500 uppercase">
                                NEEDS: {passwordStrength.feedback.join(', ')}
                            </p>
                        )}
                    </div>
                )}
                {errors.new_password && touched.new_password && (
                    <p className="text-red-500 text-xs mt-1 uppercase">{errors.new_password}</p>
                )}
            </div>

            <div>
                <Input
                    id="new_password_confirm"
                    type="password"
                    value={values.new_password_confirm}
                    onChange={(e) => setValue('new_password_confirm', e.target.value)}
                    onBlur={() => setTouched('new_password_confirm')}
                    className={passwordMatchError ? 'border-red-500' : ''}
                    placeholder="Password confirm"
                    autoComplete="new-password"
                />
                {passwordMatchError && <p className="text-red-500 text-xs mt-1 uppercase">{passwordMatchError}</p>}
            </div>

            <Button type="submit" variant="secondary" className="w-full uppercase" disabled={isLoading}>
                {isLoading ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
            </Button>

            <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase" disabled={isLoading}>
                CANCEL
            </Button>
        </form>
    );
};
