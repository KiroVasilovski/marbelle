import React, { useState } from 'react';
import { EmailChangeForm } from './EmailChangeForm';
import { useDashboard } from '../../DashboardContext';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { CheckMark } from '@/shared/components/ui/check-mark';
import { useTranslation } from 'react-i18next';

export const EmailChangePage: React.FC = () => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const { user } = useDashboard();
    const { t } = useTranslation();

    if (!user) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        setStep('success');
    };

    if (step === 'success') {
        return (
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-light tracking-wider text-neutral-900 uppercase">
                                {t('dashboard.emailChange.success.title')}
                            </h1>
                            <p className="text-neutral-600 tracking-wide mt-1">
                                {t('dashboard.emailChange.success.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <div className="bg-white rounded border border-neutral-200 p-8">
                    <div className="text-center">
                        <div className="mb-6">
                            <CheckMark size="lg" />
                            <h2 className="text-xl font-medium tracking-wide text-neutral-900 uppercase mb-2">
                                {t('dashboard.emailChange.success.message')}
                            </h2>
                            <p className="text-neutral-600 tracking-wide">{successMessage}</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-6">
                            <h3 className="font-medium text-blue-900 uppercase tracking-wide mb-3">
                                {t('dashboard.emailChange.success.steps.title')}
                            </h3>
                            <div className="text-left space-y-3 text-sm">
                                <div className="flex items-start space-x-3">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                        1
                                    </span>
                                    <p className="text-blue-800">{t('dashboard.emailChange.success.steps.first')}</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                        2
                                    </span>
                                    <p className="text-blue-800">{t('dashboard.emailChange.success.steps.second')}</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                        3
                                    </span>
                                    <p className="text-blue-800">{t('dashboard.emailChange.success.steps.third')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>{t('dashboard.emailChange.success.important.title')}</strong>{' '}
                                {t('dashboard.emailChange.success.important.message')}
                            </p>
                        </div>
                    </div>
                </div>
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
                            {t('dashboard.emailChange.title')}
                        </h1>
                        <p className="text-neutral-600 tracking-wide mt-1">{t('dashboard.emailChange.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Email Change Form */}
            <EmailChangeForm currentEmail={user.email} onSuccess={handleSuccess} />

            {/* Security Information */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-6">
                <h3 className="font-medium text-blue-900 uppercase tracking-wide mb-4">
                    {t('dashboard.emailChange.security.title')}
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start space-x-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium mt-0.5">
                            1
                        </span>
                        <p>
                            <strong>{t('dashboard.emailChange.security.firstLabel')}</strong>{' '}
                            {t('dashboard.emailChange.security.first')}
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium mt-0.5">
                            2
                        </span>
                        <p>
                            <strong>{t('dashboard.emailChange.security.secondLabel')}</strong>{' '}
                            {t('dashboard.emailChange.security.second')}
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium mt-0.5">
                            3
                        </span>
                        <p>
                            <strong>{t('dashboard.emailChange.security.thirdLabel')}</strong>{' '}
                            {t('dashboard.emailChange.security.third')}
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium mt-0.5">
                            4
                        </span>
                        <p>
                            <strong>{t('dashboard.emailChange.security.fourthLabel')}</strong>{' '}
                            {t('dashboard.emailChange.security.fourth')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
