import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PasswordResetRequest } from './PasswordResetRequest';
import { PasswordResetConfirm } from './PasswordResetConfirm';

const PasswordResetPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="w-full">{token ? <PasswordResetConfirm /> : <PasswordResetRequest />}</div>
                </div>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center">
                <img
                    src="ResetPassword.png"
                    alt="Reset Password illustration"
                    className="max-w-[1000px] w-full max-h-full object-contain"
                />
            </div>
        </div>
    );
};

export default PasswordResetPage;
