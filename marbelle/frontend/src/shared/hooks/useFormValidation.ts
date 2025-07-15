import { useState, useCallback } from 'react';

type ValidationRule<T> = {
    validator: (value: T) => boolean;
    message: string;
};

type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule<T[K]>[];
};

export function useFormValidation<T extends Record<string, string>>(
    initialValues: T,
    validationRules: ValidationRules<T>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validateField = useCallback(
        (name: keyof T, value: T[keyof T]): string | undefined => {
            const rules = validationRules[name];
            if (!rules) return undefined;

            for (const rule of rules) {
                if (!rule.validator(value)) {
                    return rule.message;
                }
            }
            return undefined;
        },
        [validationRules]
    );

    const setValue = useCallback(
        (name: keyof T, value: T[keyof T]) => {
            setValues((prev) => ({ ...prev, [name]: value }));

            // Validate if field has been touched
            if (touched[name]) {
                const error = validateField(name, value);
                setErrors((prev) => ({ ...prev, [name]: error }));
            }
        },
        [validateField, touched]
    );

    const setFieldTouched = useCallback(
        (name: keyof T) => {
            setTouched((prev) => ({ ...prev, [name]: true }));

            // Validate when field becomes touched
            const error = validateField(name, values[name]);
            setErrors((prev) => ({ ...prev, [name]: error }));
        },
        [validateField, values]
    );

    const validateAll = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        for (const [name, value] of Object.entries(values)) {
            const error = validateField(name as keyof T, value as T[keyof T]);
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

    return {
        values,
        errors,
        touched,
        setValue,
        setTouched: setFieldTouched,
        validateAll,
        reset,
        isValid: Object.keys(errors).length === 0,
    };
}
