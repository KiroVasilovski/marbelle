import * as React from 'react';
import { cn } from '../../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-12 w-full border border-input px-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = 'Input';

export type FloatingLabelInputProps = {
    label: string;
    id: string;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, type, label, id, error, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);

        const handleFocus = () => setIsFocused(true);
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
        };

        React.useEffect(() => {
            setHasValue(!!props.value || !!props.defaultValue);
        }, [props.value, props.defaultValue]);

        const isLabelFloating = isFocused || hasValue;

        return (
            <div className="relative">
                <input
                    type={type}
                    id={id}
                    className={cn(
                        'flex h-12 w-full rounded border border-input px-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 peer',
                        error && 'border-red-500',
                        className
                    )}
                    placeholder=" "
                    ref={ref}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    {...props}
                />
                <label
                    htmlFor={id}
                    className={cn(
                        'absolute text-sm text-neutral-600 duration-300 transform -translate-y-1/2 scale-100 top-1/2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2 left-3',
                        error ? 'text-red-500 peer-focus:text-red-500' : 'peer-focus:text-neutral-900',
                        isLabelFloating && !error && 'top-0 scale-75 -translate-y-1/2 text-neutral-900',
                        isLabelFloating && error && 'top-0 scale-75 -translate-y-1/2 text-red-500'
                    )}
                >
                    {label}
                </label>
            </div>
        );
    }
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { Input, FloatingLabelInput };
