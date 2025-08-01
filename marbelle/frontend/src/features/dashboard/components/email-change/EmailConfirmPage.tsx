import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/shadcn/button';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../../auth/AuthContext';
import type { User } from '../../../auth/types/auth';
import { CrossMark } from '@/shared/components/ui/cross-mark';
import { CheckMark } from '@/shared/components/ui/check-mark';
import { useTranslation } from 'react-i18next';

export const EmailConfirmPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [newUser, setNewUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const hasCalled = useRef(false);
    const { isAuthenticated } = useAuth();

    const token = searchParams.get('token');

    useEffect(() => {
        if (hasCalled.current) return;

        hasCalled.current = true;

        const confirmEmailChange = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                const updatedUser = await dashboardService.confirmEmailChange({ token });

                setStatus('success');

                if (isAuthenticated) {
                    setNewUser(updatedUser);
                }
            } catch (error: any) {
                console.error('Email confirmation failed:', error);
                setStatus('error');
            }
        };

        confirmEmailChange();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="bg-white rounded border border-neutral-200 p-8 text-center max-w-md w-full mx-4">
                    <LoadingSpinner size="md" />
                    <h2 className="text-xl font-medium tracking-wide text-neutral-900 uppercase mt-4 mb-2">
                        {t('dashboard.emailChange.confirm.loading.title')}
                    </h2>
                    <p className="text-neutral-600 tracking-wide">
                        {t('dashboard.emailChange.confirm.loading.subtitle')}
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="bg-white rounded border border-neutral-200 p-8 text-center max-w-md w-full mx-4">
                    <div className="mb-6">
                        <CrossMark size="lg" />
                        <h2 className="text-xl font-medium tracking-wide text-neutral-900 uppercase mb-2">
                            {t('dashboard.emailChange.confirm.error.title')}
                        </h2>
                        <p className="text-neutral-600 tracking-wide">
                            {t('dashboard.emailChange.confirm.error.subtitle')}
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
                        <h3 className="font-medium text-red-900 uppercase tracking-wide mb-2 text-sm">
                            {t('dashboard.emailChange.confirm.error.issues.title')}
                        </h3>
                        <ul className="text-left text-sm text-red-800 space-y-1">
                            <li>• {t('dashboard.emailChange.confirm.error.issues.first')}</li>
                            <li>• {t('dashboard.emailChange.confirm.error.issues.second')}</li>
                            <li>• {t('dashboard.emailChange.confirm.error.issues.third')}</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')} className="w-full">
                            {t('dashboard.emailChange.confirm.goToDashboardButton')}
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                            {t('dashboard.emailChange.confirm.loginWithNewEmailButton')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="bg-white rounded border border-neutral-200 p-8 text-center max-w-md w-full mx-4">
                <div className="mb-6">
                    <CheckMark size="lg" />
                    <h2 className="text-xl font-medium tracking-wide text-neutral-900 uppercase mb-2">
                        {t('dashboard.emailChange.confirm.success.title')}
                    </h2>
                    <p className="text-neutral-600 tracking-wide">
                        {t('dashboard.emailChange.confirm.success.subtitle')}
                    </p>
                </div>

                {newUser && (
                    <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
                        <h3 className="font-medium text-green-900 uppercase tracking-wide mb-2 text-sm">
                            {t('dashboard.emailChange.confirm.success.newEmail')}
                        </h3>
                        <p className="text-green-800 font-medium">{newUser.email}</p>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                    <h3 className="font-medium text-blue-900 uppercase tracking-wide mb-2 text-sm">
                        {t('dashboard.emailChange.confirm.success.steps.title')}
                    </h3>
                    <ul className="text-left text-sm text-blue-800 space-y-1">
                        <li>• {t('dashboard.emailChange.confirm.success.steps.first')}</li>
                        <li>• {t('dashboard.emailChange.confirm.success.steps.second')}</li>
                        <li>• {t('dashboard.emailChange.confirm.success.steps.third')}</li>
                        <li>• {t('dashboard.emailChange.confirm.success.steps.fourth')}</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <Button variant="secondary" onClick={() => navigate('/dashboard')} className="w-full">
                        {t('dashboard.emailChange.confirm.goToDashboardButton')}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                        {t('dashboard.emailChange.confirm.loginWithNewEmailButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
