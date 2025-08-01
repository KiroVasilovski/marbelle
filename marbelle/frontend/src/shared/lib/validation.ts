export const validationRules = {
    required: (value: string) => value.trim().length > 0,
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (min: number) => (value: string) => value.length >= min,
    maxLength: (max: number) => (value: string) => value.length <= max,
    password: (value: string) => {
        // At least 8 characters, mixed case, numbers
        return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
    },
    phone: (value: string) => {
        if (!value) return true; // Optional field
        return /^\+?1?\d{9,15}$/.test(value.replace(/\s/g, ''));
    },
    // Cross-field validation helpers
    matchesField: (fieldName: string) => (value: string, allValues?: any) => {
        if (!allValues) return true;
        return value === allValues[fieldName];
    },
    differentFromField: (fieldName: string) => (value: string, allValues?: any) => {
        if (!allValues) return true;
        return value !== allValues[fieldName];
    },
    // Optional field wrapper
    optional: (validator: (value: string, allValues?: any) => boolean) => (value: string, allValues?: any) => {
        if (!value || value.trim().length === 0) return true;
        return validator(value, allValues);
    },
};

export interface PasswordStrength {
    score: number;
    feedback: string[];
    isValid: boolean;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
        score += 1;
    } else {
        feedback.push('AT LEAST 8 CHARACTERS');
    }

    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('LOWERCASE LETTER');
    }

    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('UPPERCASE LETTER');
    }

    if (/\d/.test(password)) {
        score += 1;
    } else {
        feedback.push('NUMBER');
    }

    if (/[^a-zA-Z\d]/.test(password)) {
        score += 1;
    } else {
        feedback.push('SPECIAL CHARACTER');
    }

    return {
        score,
        feedback,
        isValid: score >= 4,
    };
};

/**
 * Enhanced password validation rule
 * Checks for comprehensive password requirements including special characters
 */
export const enhancedPassword = (value: string) => {
    return (
        value.length >= 8 &&
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value) &&
        /[^a-zA-Z\d]/.test(value)
    );
};
