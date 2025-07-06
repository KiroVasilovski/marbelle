import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { useAuth } from '../AuthContext';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules, getPasswordStrength } from '../../../shared/lib/validation';
import type { RegisterData } from '../types/auth';
import { Eye, EyeOff } from "lucide-react";

const initialValues = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    company_name: '',
    phone: '',
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

    first_name:
        [
            {
                validator: validationRules.required,
                message: 'FIRST NAME IS REQUIRED'
            }
        ],

    last_name:
        [
            {
                validator: validationRules.required,
                message: 'LAST NAME IS REQUIRED'
            }
        ],

    password:
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

    password_confirm:
        [
            {
                validator: validationRules.required,
                message: 'PASSWORD CONFIRMATION IS REQUIRED'
            }
        ],

    phone:
        [
            {
                validator: validationRules.phone,
                message: 'VALID PHONE NUMBER IS REQUIRED'
            }
        ],
};

export const RegisterForm: React.FC = () => {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

    // Additional validation for password confirmation
    const passwordMatchError =
        values.password !== values.password_confirm && touched.password_confirm ? 'PASSWORDS DO NOT MATCH' : '';

    const passwordStrength = getPasswordStrength(values.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll() || passwordMatchError) {
            return;
        }

        try {
            await register(values as RegisterData);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'REGISTRATION FAILED');
        }
    };

    if (showSuccess) {
        return (
            <div className="max-w-md mx-auto p-8 bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-10 uppercase">REGISTRATION SUCCESSFUL</h2>
                    <p className="text-gray-600 mb-10 uppercase">
                        PLEASE CHECK YOUR EMAIL FOR VERIFICATION INSTRUCTIONS
                    </p>
                    <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                        GO TO LOGIN
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 uppercase">CREATE ACCOUNT</h2>
                <p className="text-gray-600 uppercase">JOIN MARBELLE FOR PREMIUM STONE PRODUCTS</p>
            </div>

            {submitError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded uppercase">{submitError}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        id="first_name"
                        type="text"
                        value={values.first_name}
                        onChange={(e) => setValue('first_name', e.target.value)}
                        onBlur={() => setTouched('first_name')}
                        className={errors.first_name && touched.first_name ? 'border-red-500' : ''}
                        placeholder="First Name*"
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
                        placeholder="Last Name*"
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
                    placeholder="Email Address*"
                />
                {errors.email && touched.email && <p className="text-red-500 text-xs mt-1 uppercase">{errors.email}</p>}
            </div>

            <div>
                <Input
                    id="company_name"
                    type="text"
                    value={values.company_name}
                    onChange={(e) => setValue('company_name', e.target.value)}
                    placeholder="Company"
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
                    placeholder="Phone Number"
                />
                {errors.phone && touched.phone && <p className="text-red-500 text-xs mt-1 uppercase">{errors.phone}</p>}
            </div>

            <div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        onChange={(e) => setValue('password', e.target.value)}
                        onBlur={() => setTouched('password')}
                        className={errors.password && touched.password ? 'border-red-500' : ''}
                        placeholder="Password*"
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
                    placeholder="Confirm Password*"
                />
                {passwordMatchError && <p className="text-red-500 text-xs mt-1 uppercase">{passwordMatchError}</p>}
            </div>

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Button>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Already registered?{' '}
                    <Link to="/login" className="text-gray-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </form>
    );
};
