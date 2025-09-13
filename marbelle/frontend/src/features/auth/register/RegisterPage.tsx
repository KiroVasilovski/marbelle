import React from 'react';
import { RegisterForm } from './RegisterForm';

const RegisterPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <RegisterForm />
                </div>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center">
                <img
                    src="Register.png"
                    alt="Register illustration"
                    className="max-w-[1000px] w-full max-h-full object-contain"
                />
            </div>
        </div>
    );
};

export default RegisterPage;
