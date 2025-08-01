import React from 'react';
import type { PasswordStrength } from '../../hooks/usePasswordValidation';

interface PasswordStrengthIndicatorProps {
    password: string;
    strength: PasswordStrength;
    showDetails?: boolean;
    className?: string;
}

/**
 * Reusable password strength indicator component
 * Based on the superior dashboard implementation
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
    strength,
    showDetails = true,
    className = '',
}) => {
    if (!password) return null;

    return (
        <div className={`mt-3 ${className}`}>
            {/* Strength Label and Score */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-700 tracking-wide">
                    PASSWORD STRENGTH: {strength.strengthText}
                </span>
                <span className="text-xs text-neutral-500 tracking-wide">{strength.score}/5</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 rounded-full h-1">
                <div
                    className={`h-1 rounded-full transition-all duration-300 ${strength.strengthColor}`}
                    style={{ width: `${strength.progressPercentage}%` }}
                />
            </div>

            {/* Missing Requirements */}
            {showDetails && strength.feedback.length > 0 && (
                <div className="mt-2">
                    <p className="text-xs text-neutral-600 mb-1 tracking-wide">MISSING:</p>
                    <div className="flex flex-wrap gap-1">
                        {strength.feedback.map((item, index) => (
                            <span
                                key={index}
                                className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full tracking-wide"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface PasswordMatchIndicatorProps {
    password: string;
    confirmPassword: string;
    isMatch: boolean;
    error: string;
    className?: string;
}

/**
 * Password match indicator component
 */
export const PasswordMatchIndicator: React.FC<PasswordMatchIndicatorProps> = ({
    password,
    confirmPassword,
    isMatch,
    error,
    className = '',
}) => {
    if (!password || !confirmPassword) return null;

    return (
        <div className={`mt-2 ${className}`}>
            {isMatch ? (
                <p className="text-green-700 text-xs tracking-wide flex items-center">
                    <span className="mr-1">✓</span>
                    PASSWORDS MATCH
                </p>
            ) : (
                <p className="text-red-700 text-xs tracking-wide flex items-center">
                    <span className="mr-1">✗</span>
                    {error}
                </p>
            )}
        </div>
    );
};
