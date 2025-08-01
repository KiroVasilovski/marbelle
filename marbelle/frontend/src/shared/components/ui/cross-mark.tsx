import React from 'react';
import { cn } from '../../lib/utils';

interface CrossMarkProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
};

const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
};

export const CrossMark: React.FC<CrossMarkProps> = ({ size = 'md', className }) => {
    return (
        <div
            className={cn(
                'inline-flex items-center justify-center bg-red-100 rounded-full mb-4',
                sizeClasses[size],
                className
            )}
        >
            <svg
                className={cn('text-red-600', iconSizeClasses[size])}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
    );
};
