import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/shadcn/button';
import { useDashboard } from '../../DashboardContext';
import { ProfileForm } from './ProfileForm';

export const ProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const { user, profileLoading, profileError } = useDashboard();

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                    <p className="text-neutral-600 tracking-wide">LOADING PROFILE...</p>
                </div>
            </div>
        );
    }

    const formatJoinDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date
            .toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            .toUpperCase();
    };

    const getProfileCompleteness = (): { percentage: number; missingFields: string[] } => {
        const fields = [
            { key: 'first_name', label: 'FIRST NAME' },
            { key: 'last_name', label: 'LAST NAME' },
            { key: 'email', label: 'EMAIL' },
            { key: 'phone', label: 'PHONE' },
            { key: 'company_name', label: 'COMPANY' },
        ];

        const missingFields: string[] = [];
        let completed = 0;

        fields.forEach((field) => {
            if (user[field.key as keyof typeof user]) {
                completed++;
            } else if (field.key !== 'company_name') {
                // Company is optional
                missingFields.push(field.label);
            }
        });

        if (user.is_verified) completed++;
        else missingFields.push('EMAIL VERIFICATION');

        return {
            percentage: Math.round((completed / 5) * 100), // 5 core fields
            missingFields,
        };
    };

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-light tracking-wider text-neutral-900">EDIT PROFILE</h1>
                            <p className="text-neutral-600 tracking-wide mt-1">UPDATE YOUR PERSONAL INFORMATION</p>
                        </div>
                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={profileLoading}>
                            CANCEL
                        </Button>
                    </div>
                </div>

                <ProfileForm user={user} onSuccess={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
            </div>
        );
    }

    const { percentage, missingFields } = getProfileCompleteness();

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-light tracking-wider text-neutral-900">YOUR PROFILE</h1>
                        <p className="text-neutral-600 tracking-wide mt-1">MANAGE YOUR PERSONAL INFORMATION</p>
                    </div>
                    <Button onClick={() => setIsEditing(true)}>EDIT PROFILE</Button>
                </div>
            </div>

            {/* Error Display */}
            {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{profileError}</p>
                </div>
            )}

            {/* Profile Completeness */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium tracking-wide text-neutral-900">PROFILE COMPLETENESS</h2>
                    <span className="text-2xl font-light text-neutral-900">{percentage}%</span>
                </div>

                <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
                    <div
                        className="bg-neutral-900 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {missingFields.length > 0 && (
                    <div>
                        <p className="text-sm text-neutral-600 mb-2 tracking-wide">MISSING INFORMATION:</p>
                        <div className="flex flex-wrap gap-2">
                            {missingFields.map((field, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium tracking-wide"
                                >
                                    {field}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-6">PERSONAL INFORMATION</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide">FULL NAME</label>
                            <p className="text-neutral-900 mt-1 tracking-wide">
                                {user.first_name} {user.last_name}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide">EMAIL ADDRESS</label>
                            <div className="flex items-center space-x-3 mt-1">
                                <p className="text-neutral-900 tracking-wide">{user.email}</p>
                            </div>
                        </div>

                        {user.phone && (
                            <div>
                                <label className="text-sm font-medium text-neutral-600 tracking-wide">
                                    PHONE NUMBER
                                </label>
                                <p className="text-neutral-900 mt-1 tracking-wide">{user.phone}</p>
                            </div>
                        )}

                        {user.company_name && (
                            <div>
                                <label className="text-sm font-medium text-neutral-600 tracking-wide">COMPANY</label>
                                <p className="text-neutral-900 mt-1 tracking-wide">{user.company_name}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-6">ACCOUNT INFORMATION</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide">ACCOUNT TYPE</label>
                            <div className="flex items-center space-x-3 mt-1">
                                <p className="text-neutral-900 tracking-wide">
                                    {user.is_business_customer ? 'BUSINESS CUSTOMER' : 'PERSONAL CUSTOMER'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide">MEMBER SINCE</label>
                            <p className="text-neutral-900 mt-1 tracking-wide">{formatJoinDate(user.date_joined)}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide">ACCOUNT STATUS</label>
                            <div className="mt-1">
                                <span
                                    className={
                                        'text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-green-100 text-green-800'
                                    }
                                >
                                    ACTIVE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 bg-neutral-50 rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">QUICK ACTIONS</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                        EDIT INFORMATION
                    </Button>

                    <Button variant="outline" onClick={() => navigate('/dashboard/password')} className="w-full">
                        CHANGE PASSWORD
                    </Button>

                    <Button variant="outline" onClick={() => navigate('/dashboard/addresses')} className="w-full">
                        MANAGE ADDRESSES
                    </Button>
                </div>
            </div>
        </div>
    );
};
