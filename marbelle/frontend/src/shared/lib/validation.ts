export const validationRules = {
    required: (value: string) => value.trim().length > 0,
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (min: number) => (value: string) => value.length >= min,
    password: (value: string) => {
        // At least 8 characters, mixed case, numbers
        return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
    },
    phone: (value: string) => {
        if (!value) return true; // Optional field
        return /^\+?1?\d{9,15}$/.test(value.replace(/\s/g, ''));
    },
};

export const getPasswordStrength = (password: string): {
    score: number;
    feedback: string[];
} => {
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

    return { score, feedback };
};
