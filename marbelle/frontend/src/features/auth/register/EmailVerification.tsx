import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
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

export const EmailVerification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [showResendForm, setShowResendForm] = useState(false);

    const token = searchParams.get('token');

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

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
        } catch (error) {
            setVerificationStatus('error');
            setSubmitError(error instanceof Error ? error.message : 'EMAIL VERIFICATION FAILED');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll()) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.resendVerification(values.email);
            setShowResendForm(false);
            reset();
            alert('VERIFICATION EMAIL SENT! PLEASE CHECK YOUR INBOX.');
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'FAILED TO SEND EMAIL');
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while verifying
    if (token && isVerifying) {
        return (
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2 uppercase">VERIFYING EMAIL</h2>
                    <p className="text-gray-600 uppercase">PLEASE WAIT WHILE WE VERIFY YOUR EMAIL ADDRESS...</p>
                </div>
            </div>
        );
    }

    // Show success state
    if (verificationStatus === 'success') {
        return (
            <div className="max-w-md mx-auto p-8 bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-10 uppercase text-green-600">EMAIL VERIFIED</h2>
                    <p className="text-gray-600 mb-10 uppercase">
                        YOUR EMAIL HAS BEEN SUCCESSFULLY VERIFIED. YOUR ACCOUNT IS NOW ACTIVE
                    </p>
                    <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                        SIGN IN TO YOUR ACCOUNT
                    </Button>
                </div>
            </div>
        );
    }

    // Show error state or manual verification form
    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 uppercase">EMAIL VERIFICATION</h2>
                {verificationStatus === 'error' ? (
                    <div>
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
                        <p className="text-gray-600 uppercase mb-4">VERIFICATION FAILED</p>
                    </div>
                ) : (
                    <p className="text-gray-600 uppercase">VERIFY YOUR EMAIL TO ACTIVATE YOUR ACCOUNT</p>
                )}
            </div>

            {submitError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded uppercase">{submitError}</div>
            )}

            {!showResendForm ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center uppercase">
                        DIDN&apos;T RECEIVE THE VERIFICATION EMAIL?
                    </p>
                    <Button onClick={() => setShowResendForm(true)} variant="outline" className="w-full uppercase">
                        RESEND VERIFICATION EMAIL
                    </Button>
                    <div className="text-center">
                        <Link to="/login" className="text-blue-600 hover:underline text-sm uppercase">
                            BACK TO LOGIN
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleResendEmail} className="space-y-4">
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
                        {errors.email && touched.email && (
                            <p className="text-red-500 text-xs mt-1 uppercase">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button type="submit" className="w-full uppercase" disabled={isLoading}>
                            {isLoading ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowResendForm(false)}
                            variant="outline"
                            className="w-full uppercase"
                        >
                            CANCEL
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};
