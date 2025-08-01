import { useMemo } from 'react';

export interface PasswordStrength {
    score: number;
    feedback: string[];
    isValid: boolean;
    strengthText: 'WEAK' | 'MEDIUM' | 'STRONG';
    strengthColor: string;
    progressPercentage: number;
}

export interface PasswordValidationOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    minScore?: number;
}

const DEFAULT_OPTIONS: PasswordValidationOptions = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minScore: 4,
};

/**
 * Enhanced password validation hook with comprehensive strength checking
 * Based on the superior dashboard implementation with improvements
 */
export const usePasswordValidation = (password: string, options: PasswordValidationOptions = {}): PasswordStrength => {
    const config = { ...DEFAULT_OPTIONS, ...options };

    const passwordStrength = useMemo((): PasswordStrength => {
        const feedback: string[] = [];
        let score = 0;

        // Length check
        if (config.minLength && password.length >= config.minLength) {
            score += 1;
        } else if (config.minLength) {
            feedback.push(`AT LEAST ${config.minLength} CHARACTERS`);
        }

        // Lowercase check
        if (config.requireLowercase) {
            if (/[a-z]/.test(password)) {
                score += 1;
            } else {
                feedback.push('LOWERCASE LETTER');
            }
        }

        // Uppercase check
        if (config.requireUppercase) {
            if (/[A-Z]/.test(password)) {
                score += 1;
            } else {
                feedback.push('UPPERCASE LETTER');
            }
        }

        // Numbers check
        if (config.requireNumbers) {
            if (/\d/.test(password)) {
                score += 1;
            } else {
                feedback.push('NUMBER');
            }
        }

        // Special characters check
        if (config.requireSpecialChars) {
            if (/[^a-zA-Z\d]/.test(password)) {
                score += 1;
            } else {
                feedback.push('SPECIAL CHARACTER');
            }
        }

        // Calculate maximum possible score
        const maxScore =
            Object.values(config).filter((value, index) => index > 0 && value === true).length +
            (config.minLength ? 1 : 0);

        // Determine strength text and color
        let strengthText: 'WEAK' | 'MEDIUM' | 'STRONG';
        let strengthColor: string;

        const scoreRatio = maxScore > 0 ? score / maxScore : 0;

        if (scoreRatio <= 0.4) {
            strengthText = 'WEAK';
            strengthColor = 'bg-red-700';
        } else if (scoreRatio <= 0.8) {
            strengthText = 'MEDIUM';
            strengthColor = 'bg-yellow-600';
        } else {
            strengthText = 'STRONG';
            strengthColor = 'bg-green-600';
        }

        return {
            score,
            feedback,
            isValid: score >= (config.minScore || maxScore),
            strengthText,
            strengthColor,
            progressPercentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
        };
    }, [password, config]);

    return passwordStrength;
};

/**
 * Password matching validation hook
 * Validates that two passwords match
 */
export const usePasswordMatch = (password: string, confirmPassword: string) => {
    return useMemo(() => {
        if (!password || !confirmPassword) {
            return { isMatch: false, error: '' };
        }

        const isMatch = password === confirmPassword;
        return {
            isMatch,
            error: isMatch ? '' : 'PASSWORDS DO NOT MATCH',
        };
    }, [password, confirmPassword]);
};

/**
 * Combined password validation hook
 * Combines strength validation and password matching
 */
export const useCompletePasswordValidation = (
    password: string,
    confirmPassword: string,
    options?: PasswordValidationOptions
) => {
    const strength = usePasswordValidation(password, options);
    const match = usePasswordMatch(password, confirmPassword);

    return {
        strength,
        match,
        isFormValid: strength.isValid && match.isMatch && password && confirmPassword,
    };
};
