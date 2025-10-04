import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus, Minus } from 'lucide-react';

import { cn } from '../../lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
    React.ComponentRef<typeof AccordionPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={cn(className)} {...props} />);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
    React.ComponentRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            ref={ref}
            className={cn(
                'flex flex-1 items-center justify-between py-4 font-medium transition-all cursor-pointer',
                'hover:text-gray-600',
                '[&[data-state=open]_.icon-plus]:rotate-90 [&[data-state=open]_.icon-plus]:opacity-0',
                '[&[data-state=closed]_.icon-minus]:-rotate-90 [&[data-state=closed]_.icon-minus]:opacity-0',
                '[&:hover_.icon-plus]:text-gray-600 [&:hover_.icon-minus]:text-gray-600',
                className
            )}
            {...props}
        >
            {children}
            <div className="relative h-4 w-4 shrink-0">
                <Plus className="icon-plus absolute inset-0 h-4 w-4 transition-all duration-200" />
                <Minus className="icon-minus absolute inset-0 h-4 w-4 transition-all duration-200" />
            </div>
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
    React.ComponentRef<typeof AccordionPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
        ref={ref}
        className={cn(
            'overflow-hidden text-sm transition-all',
            'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
            className
        )}
        {...props}
    >
        <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
