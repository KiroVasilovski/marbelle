import React, { useState } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import { useDashboard } from '../../DashboardContext';
import { dashboardService } from '../../services/dashboardService';
import type { PasswordChangeData } from '../../types/dashboard';

interface FormErrors {
    [key: string]: string;
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    isValid: boolean;
}

export const PasswordPage: React.FC = () => {
    const { changePassword, profileLoading, profileError } = useDashboard();
    
    const [formData, setFormData] = useState<PasswordChangeData>({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [success, setSuccess] = useState(false);

    const calculatePasswordStrength = (password: string): PasswordStrength => {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('AT LEAST 8 CHARACTERS');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('LOWERCASE LETTER');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('UPPERCASE LETTER');
        }

        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('NUMBER');
        }

        if (/[^a-zA-Z\d]/.test(password)) {
            score += 1;
        } else {
            feedback.push('SPECIAL CHARACTER');
        }

        return {
            score,
            feedback,
            isValid: score >= 4,
        };
    };

    const passwordStrength = calculatePasswordStrength(formData.new_password);

    const getStrengthColor = (score: number): string => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score: number): string => {
        if (score <= 2) return 'WEAK';
        if (score <= 3) return 'MEDIUM';
        return 'STRONG';
    };

    const handleInputChange = (field: keyof PasswordChangeData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSuccess(false);
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleBlur = (field: keyof PasswordChangeData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, formData[field]);
    };

    const validateField = (field: keyof PasswordChangeData, value: string) => {
        const newErrors = { ...errors };

        switch (field) {
            case 'current_password':
                if (!value) {
                    newErrors.current_password = 'Current password is required';
                } else {
                    delete newErrors.current_password;
                }
                break;

            case 'new_password':
                if (!value) {
                    newErrors.new_password = 'New password is required';
                } else if (value.length < 8) {
                    newErrors.new_password = 'Password must be at least 8 characters long';
                } else if (value === formData.current_password) {
                    newErrors.new_password = 'New password must be different from current password';
                } else {
                    delete newErrors.new_password;
                }
                break;

            case 'new_password_confirm':
                if (!value) {
                    newErrors.new_password_confirm = 'Password confirmation is required';
                } else if (value !== formData.new_password) {
                    newErrors.new_password_confirm = 'Passwords do not match';
                } else {
                    delete newErrors.new_password_confirm;
                }
                break;

            default:
                delete newErrors[field];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (): boolean => {
        const validationErrors = dashboardService.validatePasswordData(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        setTouched(allTouched);

        if (!validateForm()) {
            return;
        }

        try {
            await changePassword(formData);
            setSuccess(true);
            
            // Reset form
            setFormData({
                current_password: '',
                new_password: '',
                new_password_confirm: '',
            });
            setTouched({});
            setErrors({});
        } catch (error) {
            console.error('Password change failed:', error);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-light tracking-wider text-neutral-900">
                    CHANGE PASSWORD
                </h1>
                <p className="text-neutral-600 tracking-wide mt-1">
                    UPDATE YOUR PASSWORD TO KEEP YOUR ACCOUNT SECURE
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className="text-green-800 text-sm tracking-wide font-medium">
                            PASSWORD CHANGED SUCCESSFULLY
                        </p>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{profileError}</p>
                </div>
            )}

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2 tracking-wide">
                    PASSWORD SECURITY TIPS
                </h3>
                <ul className="text-xs text-blue-800 space-y-1 tracking-wide">
                    <li>• USE A STRONG, UNIQUE PASSWORD</li>
                    <li>• INCLUDE UPPERCASE AND LOWERCASE LETTERS</li>
                    <li>• ADD NUMBERS AND SPECIAL CHARACTERS</li>
                    <li>• AVOID PERSONAL INFORMATION</li>
                    <li>• DON'T REUSE PASSWORDS FROM OTHER ACCOUNTS</li>
                </ul>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label htmlFor="current_password" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                            CURRENT PASSWORD *
                        </label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.current_password}
                                onChange={(e) => handleInputChange('current_password', e.target.value)}
                                onBlur={() => handleBlur('current_password')}
                                className={`pr-12 ${errors.current_password && touched.current_password ? 'border-red-500' : ''}`}
                                placeholder="ENTER YOUR CURRENT PASSWORD"
                                disabled={profileLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                disabled={profileLoading}
                            >
                                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                            </Button>
                        </div>
                        {errors.current_password && touched.current_password && (
                            <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.current_password}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                            NEW PASSWORD *
                        </label>
                        <div className="relative">
                            <Input
                                id="new_password"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.new_password}
                                onChange={(e) => handleInputChange('new_password', e.target.value)}
                                onBlur={() => handleBlur('new_password')}
                                className={`pr-12 ${errors.new_password && touched.new_password ? 'border-red-500' : ''}`}
                                placeholder="ENTER YOUR NEW PASSWORD"
                                disabled={profileLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                disabled={profileLoading}
                            >
                                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                            </Button>
                        </div>
                        {errors.new_password && touched.new_password && (
                            <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.new_password}</p>
                        )}

                        {/* Password Strength Indicator */}
                        {formData.new_password && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-neutral-700 tracking-wide">
                                        PASSWORD STRENGTH: {getStrengthText(passwordStrength.score)}
                                    </span>
                                    <span className="text-xs text-neutral-500 tracking-wide">
                                        {passwordStrength.score}/5
                                    </span>
                                </div>
                                
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    />
                                </div>
                                
                                {passwordStrength.feedback.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-neutral-600 mb-1 tracking-wide">
                                            MISSING:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {passwordStrength.feedback.map((item, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full tracking-wide"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="new_password_confirm" className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide">
                            CONFIRM NEW PASSWORD *
                        </label>
                        <div className="relative">
                            <Input
                                id="new_password_confirm"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.new_password_confirm}
                                onChange={(e) => handleInputChange('new_password_confirm', e.target.value)}
                                onBlur={() => handleBlur('new_password_confirm')}
                                className={`pr-12 ${errors.new_password_confirm && touched.new_password_confirm ? 'border-red-500' : ''}`}
                                placeholder="CONFIRM YOUR NEW PASSWORD"
                                disabled={profileLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                disabled={profileLoading}
                            >
                                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                            </Button>
                        </div>
                        {errors.new_password_confirm && touched.new_password_confirm && (
                            <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.new_password_confirm}</p>
                        )}

                        {/* Password Match Indicator */}
                        {formData.new_password && formData.new_password_confirm && (
                            <div className="mt-2">
                                {formData.new_password === formData.new_password_confirm ? (
                                    <p className="text-green-600 text-xs tracking-wide flex items-center">
                                        <span className="mr-1">✓</span>
                                        PASSWORDS MATCH
                                    </p>
                                ) : (
                                    <p className="text-red-600 text-xs tracking-wide flex items-center">
                                        <span className="mr-1">✗</span>
                                        PASSWORDS DO NOT MATCH
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="pt-6 border-t border-neutral-200">
                        <Button
                            type="submit"
                            disabled={
                                profileLoading || 
                                Object.keys(errors).length > 0 || 
                                !passwordStrength.isValid ||
                                !formData.current_password ||
                                !formData.new_password ||
                                !formData.new_password_confirm
                            }
                            className="w-full md:w-auto min-w-[200px]"
                        >
                            {profileLoading ? 'CHANGING PASSWORD...' : 'CHANGE PASSWORD'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Additional Security */}
            <div className="mt-8 bg-neutral-50 rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                    ADDITIONAL SECURITY
                </h3>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-900 tracking-wide">
                                TWO-FACTOR AUTHENTICATION
                            </p>
                            <p className="text-xs text-neutral-600 tracking-wide">
                                COMING SOON - ADD AN EXTRA LAYER OF SECURITY
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            ENABLE
                        </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-900 tracking-wide">
                                LOGIN ACTIVITY
                            </p>
                            <p className="text-xs text-neutral-600 tracking-wide">
                                COMING SOON - MONITOR YOUR ACCOUNT ACCESS
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            VIEW
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};