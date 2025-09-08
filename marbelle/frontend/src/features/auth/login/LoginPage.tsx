import React from 'react';
import { LoginForm } from './LoginForm';

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;
