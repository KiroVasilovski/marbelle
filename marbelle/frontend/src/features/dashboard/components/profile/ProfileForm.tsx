import React, { useState, useEffect } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { Input } from '../../../../shared/components/ui/input';
import { useDashboard } from '../../DashboardContext';
import { dashboardService } from '../../services/dashboardService';
import type { User } from '../../../auth/types/auth';
import type { ProfileUpdateData } from '../../types/dashboard';

interface ProfileFormProps {
    user: User;
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface FormErrors {
    [key: string]: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSuccess, onCancel }) => {
    const { updateProfile, profileLoading, profileError } = useDashboard();

    const [formData, setFormData] = useState<ProfileUpdateData>({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Check for changes
    useEffect(() => {
        const originalData = {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            company_name: user.company_name || '',
        };

        const dataChanged = Object.keys(formData).some(
            (key) => formData[key as keyof ProfileUpdateData] !== originalData[key as keyof ProfileUpdateData]
        );

        setHasChanges(dataChanged);
    }, [formData, user]);

    const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleBlur = (field: keyof ProfileUpdateData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field, formData[field]);
    };

    const validateField = (field: keyof ProfileUpdateData, value: string) => {
        const newErrors = { ...errors };

        switch (field) {
            case 'first_name':
                if (!value.trim()) {
                    newErrors.first_name = 'First name is required';
                } else {
                    delete newErrors.first_name;
                }
                break;

            case 'last_name':
                if (!value.trim()) {
                    newErrors.last_name = 'Last name is required';
                } else {
                    delete newErrors.last_name;
                }
                break;

            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'phone':
                if (value && value.trim()) {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                        newErrors.phone = 'Please enter a valid phone number';
                    } else {
                        delete newErrors.phone;
                    }
                } else {
                    delete newErrors.phone;
                }
                break;

            default:
                delete newErrors[field];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (): boolean => {
        const validationErrors = dashboardService.validateProfileData(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce(
            (acc, key) => {
                acc[key] = true;
                return acc;
            },
            {} as { [key: string]: boolean }
        );
        setTouched(allTouched);

        if (!validateForm()) {
            return;
        }

        try {
            await updateProfile(formData);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // Error is handled by context
            console.error('Profile update failed:', error);
        }
    };

    const handleReset = () => {
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            company_name: user.company_name || '',
        });
        setErrors({});
        setTouched({});
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Error Display */}
                {profileError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm tracking-wide">{profileError}</p>
                    </div>
                )}

                {/* Personal Information Section */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">PERSONAL INFORMATION</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="first_name"
                                className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide"
                            >
                                FIRST NAME *
                            </label>
                            <Input
                                id="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                onBlur={() => handleBlur('first_name')}
                                className={`${errors.first_name && touched.first_name ? 'border-red-500' : ''}`}
                                placeholder="ENTER YOUR FIRST NAME"
                                disabled={profileLoading}
                            />
                            {errors.first_name && touched.first_name && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.first_name}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="last_name"
                                className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide"
                            >
                                LAST NAME *
                            </label>
                            <Input
                                id="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                onBlur={() => handleBlur('last_name')}
                                className={`${errors.last_name && touched.last_name ? 'border-red-500' : ''}`}
                                placeholder="ENTER YOUR LAST NAME"
                                disabled={profileLoading}
                            />
                            {errors.last_name && touched.last_name && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.last_name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">CONTACT INFORMATION</h3>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide"
                            >
                                EMAIL ADDRESS *
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                className={`${errors.email && touched.email ? 'border-red-500' : ''}`}
                                placeholder="ENTER YOUR EMAIL ADDRESS"
                                disabled={profileLoading}
                            />
                            {errors.email && touched.email && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.email}</p>
                            )}
                            {formData.email !== user.email && (
                                <p className="text-yellow-600 text-xs mt-1 tracking-wide">
                                    EMAIL CHANGE WILL REQUIRE RE-VERIFICATION
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide"
                            >
                                PHONE NUMBER
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                onBlur={() => handleBlur('phone')}
                                className={`${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                                placeholder="ENTER YOUR PHONE NUMBER"
                                disabled={profileLoading}
                            />
                            {errors.phone && touched.phone && (
                                <p className="text-red-600 text-xs mt-1 tracking-wide">{errors.phone}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Business Information Section */}
                <div>
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">BUSINESS INFORMATION</h3>

                    <div>
                        <label
                            htmlFor="company_name"
                            className="block text-sm font-medium text-neutral-700 mb-2 tracking-wide"
                        >
                            COMPANY NAME
                        </label>
                        <p className="text-neutral-500 text-xs mt-1 mb-2 tracking-wide">
                            Adding a company name will mark your account as a business customer.
                        </p>
                        <Input
                            id="company_name"
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            onBlur={() => handleBlur('company_name')}
                            placeholder="ENTER YOUR COMPANY NAME (OPTIONAL)"
                            disabled={profileLoading}
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <div className="flex space-x-3">
                        <Button
                            type="submit"
                            disabled={profileLoading || !hasChanges || Object.keys(errors).length > 0}
                            className="min-w-[120px]"
                        >
                            {profileLoading ? 'SAVING...' : 'SAVE CHANGES'}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={profileLoading || !hasChanges}
                        >
                            RESET
                        </Button>
                    </div>

                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={profileLoading}>
                            CANCEL
                        </Button>
                    )}
                </div>

                {/* Change Indicator */}
                {hasChanges && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm tracking-wide">YOU HAVE UNSAVED CHANGES</p>
                    </div>
                )}
            </form>
        </div>
    );
};
