import React, { useState } from 'react';
import { PhoneInput as ReactPhoneInput, defaultCountries } from 'react-international-phone';
import 'react-international-phone/style.css';
import { cn } from '../../lib/utils';

export interface PhoneInputProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (phone: string) => void;
    onBlur?: () => void;
    error?: string;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    defaultCountry?: string;
    clearOnCountryCodeOnly?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    id,
    label,
    value,
    onChange,
    onBlur,
    error,
    className,
    disabled = false,
    placeholder,
    defaultCountry = 'de',
    clearOnCountryCodeOnly = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = !!value;
    const isLabelFloating = isFocused || hasValue;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    const handlePhoneChange = (phone: string) => {
        if (clearOnCountryCodeOnly) {
            const countryCodes = defaultCountries.map((country) => `+${country[2]}`);

            if (countryCodes.includes(phone)) {
                onChange('');
                return;
            }
        }

        onChange(phone);
    };

    return (
        <div className={cn('relative', className)}>
            <div className="relative flex w-full z-11">
                <ReactPhoneInput
                    className="w-full"
                    defaultCountry={defaultCountry}
                    value={value}
                    onChange={handlePhoneChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={placeholder}
                    inputProps={{
                        id,
                        className: cn(
                            'flex h-12 w-full rounded-r border border-l-0 bg-background text-sm ring-offset-background peer',
                            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                            'focus-visible:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error ? 'border-red-700' : 'border-input focus-visible:ring-ring'
                        ),
                        placeholder: ' ',
                        onFocus: handleFocus,
                        onBlur: handleBlur,
                    }}
                    countrySelectorStyleProps={{
                        className: cn(
                            'h-12 px-2 border border-r-0 rounded-l',
                            'flex items-center justify-center',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error ? 'border-red-700' : 'border-input'
                        ),
                        buttonClassName: cn('!border-0 h-12 w-14 !p-0 !m-0 focus:!outline-none focus:!ring-0'),
                    }}
                />
                {label && (
                    <label
                        htmlFor={id}
                        className={cn(
                            'absolute text-sm cursor-text text-neutral-600 duration-300 transform -translate-y-1/2 scale-100 top-1/2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-1/2 left-3',
                            error ? 'text-red-700 peer-focus:text-red-700' : 'peer-focus:text-neutral-900',
                            isLabelFloating && !error && 'top-0 scale-75 -translate-y-1/2 text-neutral-900',
                            isLabelFloating && error && 'top-0 scale-75 -translate-y-1/2 text-red-700'
                        )}
                    >
                        {label}
                    </label>
                )}
            </div>
        </div>
    );
};
