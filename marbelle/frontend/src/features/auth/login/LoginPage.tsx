import React from 'react';
import { LoginForm } from './LoginForm';

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <LoginForm />
                </div>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center">
                <img
                    src="Login.png"
                    alt="Login illustration"
                    className="max-w-[1000px] w-full max-h-full object-contain"
                />
            </div>
        </div>
    );
};

export default LoginPage;
