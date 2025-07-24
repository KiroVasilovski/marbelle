import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { Input } from '../../../shared/components/ui/input';
import { LoadingSpinner } from '../../../shared/components/ui/loading-spinner';
import { AuthWindow } from '../ui/auth-window';
import { authService } from '../services/authService';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../shared/lib/validation';

const initialValues = {
    email: '',
};

const validation = {
    email: [
        {
            validator: validationRules.required,
            message: 'EMAIL IS REQUIRED',
        },
        {
            validator: validationRules.email,
            message: 'VALID EMAIL IS REQUIRED',
        },
    ],
};

export const EmailVerification: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

    const token = searchParams.get('token');

    const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation(initialValues, validation);

    // Auto-verify if token is present in URL
    useEffect(() => {
        if (token) {
            verifyEmailToken(token);
        }
    }, [token]);

    const verifyEmailToken = async (verificationToken: string) => {
        setIsVerifying(true);
        try {
            await authService.verifyEmail(verificationToken);
            setVerificationStatus('success');
        } catch {
            setVerificationStatus('error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) {
            return;
        }

        setIsLoading(true);

        authService
            .resendVerification(values.email)
            .then(() => {
                navigate('/login');
            })
            .catch(() => {
                setIsLoading(false);
            })
            .finally(() => {
                //
            });
    };

    // Show loading state while verifying
    if (token && isVerifying) {
        return (
            <AuthWindow title="VERIFYING EMAIL" subtitle="Please wait while we verify your Email address...">
                <div className="text-center">
                    <LoadingSpinner className="mx-auto mb-6" />
                </div>
            </AuthWindow>
        );
    }

    // Show success state
    if (verificationStatus === 'success') {
        return (
            <AuthWindow
                title=""
                success={{
                    title: 'EMAIL VERIFIED',
                    message:
                        'Your Email has been successfully verified. Your account is now active and you can sign in.',
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
                                SIGN IN TO YOUR ACCOUNT
                            </Button>
                        </>
                    ),
                }}
            ></AuthWindow>
        );
    }

    // Show error state or manual verification form
    if (verificationStatus === 'error') {
        return (
            <AuthWindow title="EMAIL VERIFICATION">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </div>
                    <h3 className="text-lg text-red-500 mb-2">Verification failed!</h3>
                    <p className="text-gray-600 mb-4">
                        Please try again or request a new verification email. If you have already verified your email,
                        you can ignore this message.
                    </p>
                    <div className="space-y-6">
                        <Button
                            onClick={() => {
                                searchParams.delete('token');
                                setSearchParams(searchParams);
                                setVerificationStatus('pending');
                            }}
                            variant="secondary"
                            className="w-full uppercase"
                        >
                            RESEND VERIFICATION EMAIL
                        </Button>
                        <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                            CANCEL
                        </Button>
                    </div>
                </div>
            </AuthWindow>
        );
    }

    return (
        <AuthWindow
            title="EMAIL VERIFICATION"
            subtitle="Didn't receive the verification email? Enter your email below to resend it."
            isForm={true}
            onSubmit={handleResendEmail}
        >
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

            <div className="space-y-6">
                <Button type="submit" variant="secondary" className="w-full uppercase" disabled={isLoading}>
                    {isLoading ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
                </Button>
                <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                    CANCEL
                </Button>
            </div>
        </AuthWindow>
    );
};
