import React from 'react';
import { cn } from '../../../shared/lib/utils';

interface AuthWindowProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    isForm?: boolean;
    onSubmit?: (e: React.FormEvent) => void;
    error?: string;
    success?: {
        title: string;
        message: string;
        action?: React.ReactNode;
    };
    className?: string;
}

export const AuthWindow: React.FC<AuthWindowProps> = ({
    title,
    subtitle,
    children,
    isForm = false,
    onSubmit,
    error,
    success,
    className
}) => {
    const containerClasses = cn(
        'max-w-md mx-auto p-8 bg-white',
        isForm && 'space-y-6',
        className
    );

    const content = (
        <>
            <div className="text-center">
                <h2 className={cn(
                    'text-2xl font-bold mb-6 uppercase',
                    success ? 'text-green-600' : ''
                )}>
                    {success ? success.title : title}
                </h2>

                {(subtitle || success?.message) && (
                    <p className="text-gray-600 mb-6">
                        {success ? success.message : subtitle}
                    </p>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded uppercase mb-6">
                    {error}
                </div>
            )}

            {success ? (
                <div className="text-center">
                    {success.action}
                </div>
            ) : (
                children
            )}
        </>
    );

    if (isForm && onSubmit) {
        return (
            <form onSubmit={onSubmit} className={containerClasses}>
                {content}
            </form>
        );
    }

    return (
        <div className={containerClasses}>
            {content}
        </div>
    );
};