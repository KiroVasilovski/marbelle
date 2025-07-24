import * as React from 'react';
import {
    Select as ShadcnSelect,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '../shadcn/select';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
    ({ options, value, onValueChange, placeholder, label, disabled, className, id, ...props }, ref) => {
        return (
            <ShadcnSelect value={value} onValueChange={onValueChange} disabled={disabled} {...props}>
                <SelectTrigger 
                    ref={ref} 
                    className={`flex !h-12 w-full border border-input px-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
                    id={id}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {label && <SelectLabel>{label}</SelectLabel>}
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </ShadcnSelect>
        );
    }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };