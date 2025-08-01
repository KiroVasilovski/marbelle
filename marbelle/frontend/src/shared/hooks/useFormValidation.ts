import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T> = {
    validator: (value: T, allValues?: any) => boolean;
    message: string;
};

type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule<T[K]>[];
};

interface FormValidationOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, string>>(
    initialValues: T,
    validationRules: ValidationRules<T>,
    options: FormValidationOptions = {
        validateOnChange: true,
        validateOnBlur: true,
    }
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validateField = useCallback(
        (name: keyof T, value: T[keyof T], allValues?: T): string | undefined => {
            const rules = validationRules[name];
            if (!rules) return undefined;

            for (const rule of rules) {
                if (!rule.validator(value, allValues || values)) {
                    return rule.message;
                }
            }
            return undefined;
        },
        [validationRules, values]
    );

    const setValue = useCallback(
        (name: keyof T, value: T[keyof T]) => {
            const newValues = { ...values, [name]: value };
            setValues(newValues);

            // Validate if field has been touched and validateOnChange is enabled
            if (options.validateOnChange && touched[name]) {
                const error = validateField(name, value, newValues);
                setErrors((prev) => ({ ...prev, [name]: error }));
            }
        },
        [validateField, touched, values, options.validateOnChange]
    );

    const setFieldTouched = useCallback(
        (name: keyof T) => {
            setTouched((prev) => ({ ...prev, [name]: true }));

            // Validate when field becomes touched and validateOnBlur is enabled
            if (options.validateOnBlur) {
                const error = validateField(name, values[name], values);
                setErrors((prev) => ({ ...prev, [name]: error }));
            }
        },
        [validateField, values, options.validateOnBlur]
    );

    const validateAll = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        for (const [name, value] of Object.entries(values)) {
            const error = validateField(name as keyof T, value as T[keyof T], values);
            if (error) {
                newErrors[name as keyof T] = error;
                isValid = false;
            }
        }

        setErrors(newErrors);
        setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        return isValid;
    }, [values, validateField]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    // Enhanced computed states for form interactions
    const hasChanges = useMemo(() => {
        return Object.keys(values).some((key) => values[key as keyof T] !== initialValues[key as keyof T]);
    }, [values, initialValues]);

    const hasBlockingErrors = useMemo(() => {
        // Only count errors for fields that have been touched
        // This prevents the form from being blocked by untouched field errors
        return Object.keys(errors).some((errorKey) => {
            const fieldKey = errorKey as keyof T;
            const isTouched = touched[fieldKey];
            const errorMessage = errors[fieldKey];
            return isTouched && errorMessage;
        });
    }, [errors, touched]);

    const canSubmit = useMemo(() => {
        return hasChanges && !hasBlockingErrors;
    }, [hasChanges, hasBlockingErrors]);

    const canReset = useMemo(() => {
        return hasChanges;
    }, [hasChanges]);

    return {
        values,
        errors,
        touched,
        setValue,
        setTouched: setFieldTouched,
        validateAll,
        reset,
        // Legacy compatibility
        isValid: Object.keys(errors).length === 0,
        // Enhanced form state
        hasChanges,
        hasBlockingErrors,
        canSubmit,
        canReset,
    };
}
