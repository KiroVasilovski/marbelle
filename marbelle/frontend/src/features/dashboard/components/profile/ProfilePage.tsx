import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../shared/components/shadcn/button';
import { useDashboard } from '../../DashboardContext';
import { ProfileForm } from './ProfileForm';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { useTranslation } from 'react-i18next';

export const ProfilePage: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { user, profileError } = useDashboard();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!user) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <LoadingSpinner size="md" />
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

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-light tracking-wider text-neutral-900 uppercase">
                                {t('dashboard.profile.form.editProfile')}
                            </h1>
                            <p className="text-neutral-600 tracking-wide mt-1">
                                {t('dashboard.profile.form.editProfileDescription')}
                            </p>
                        </div>
                    </div>
                </div>

                <ProfileForm user={user} onSuccess={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-light tracking-wider text-neutral-900 uppercase">
                            {t('dashboard.profile.title')}
                        </h1>
                        <p className="text-neutral-600 tracking-wide mt-1">{t('dashboard.profile.subtitle')}</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        {t('dashboard.profile.editProfileButton')}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{profileError}</p>
                </div>
            )}

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-6 uppercase">
                        {t('dashboard.profile.personalInformation')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                {t('dashboard.profile.fullName')}
                            </label>
                            <p className="text-neutral-900 mt-1 tracking-wide">
                                {user.first_name} {user.last_name}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                {t('dashboard.profile.email')}
                            </label>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-neutral-900 tracking-wide">{user.email}</p>
                            </div>
                        </div>

                        {user.phone && (
                            <div>
                                <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                    {t('dashboard.profile.phone')}
                                </label>
                                <p className="text-neutral-900 mt-1 tracking-wide">{user.phone}</p>
                            </div>
                        )}

                        {user.company_name && (
                            <div>
                                <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                    {t('dashboard.profile.company')}
                                </label>
                                <p className="text-neutral-900 mt-1 tracking-wide">{user.company_name}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-6 uppercase">
                        {t('dashboard.profile.accountInformation')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                {t('dashboard.profile.accountType')}
                            </label>
                            <div className="flex items-center space-x-3 mt-1">
                                <p className="text-neutral-900 tracking-wide">
                                    {user.is_business_customer ? 'Business Customer' : 'Personal Customer'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                {t('dashboard.profile.memberSince')}
                            </label>
                            <p className="text-neutral-900 mt-1 tracking-wide">{formatJoinDate(user.date_joined)}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                {t('dashboard.profile.accountStatus')}
                            </label>
                            <div className="mt-1">
                                <span
                                    className={
                                        'text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-green-100 text-green-800 uppercase'
                                    }
                                >
                                    {t('dashboard.profile.accountStatusActive')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 rounded border border-neutral-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => navigate('/dashboard/email-change')} className="w-full">
                        {t('dashboard.profile.changeEmailButton')}
                    </Button>

                    <Button variant="outline" onClick={() => navigate('/dashboard/password')} className="w-full">
                        {t('dashboard.profile.changePasswordButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
