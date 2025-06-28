import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PasswordResetRequest } from '@/components/auth/PasswordResetRequest';
import { PasswordResetConfirm } from '@/components/auth/PasswordResetConfirm';

const PasswordResetPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                {token ? <PasswordResetConfirm /> : <PasswordResetRequest />}
            </div>
        </div>
    );
};

export default PasswordResetPage;