import React from 'react';
import { EmailVerification } from '@/features/auth/register/EmailVerification';

const EmailVerifyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <EmailVerification />
            </div>
        </div>
    );
};

export default EmailVerifyPage;
