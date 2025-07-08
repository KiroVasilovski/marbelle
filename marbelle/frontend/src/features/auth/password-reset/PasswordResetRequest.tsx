import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { authService } from '../services/authService';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../shared/lib/validation';

const initialValues = {
    email: '',
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
};

export const PasswordResetRequest: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll()) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.requestPasswordReset(values.email);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'RESET REQUEST FAILED');
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="max-w-md mx-auto p-8 bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 uppercase">CHECK YOUR EMAIL</h2>
                    <p className="text-gray-600 mb-6">
                        If this email is registered, you will receive instructions to reset your password.
                    </p>
                    <div className="space-y-6">
                        <Button onClick={() => setShowSuccess(false)} variant="outline" className="w-full uppercase">
                            SEND ANOTHER EMAIL
                        </Button>

                        <Button asChild className="w-full uppercase" variant="secondary">
                            <Link to="/login">BACK TO LOGIN</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 uppercase">RESET PASSWORD</h2>
                <p className="text-gray-600">Enter your email address to receive a password reset link.</p>
            </div>

            {submitError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded uppercase">{submitError}</div>
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

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
                {isLoading ? 'SENDING...' : 'SEND RESET EMAIL'}
            </Button>

            <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                CANCEL
            </Button>
        </form>
    );
};
