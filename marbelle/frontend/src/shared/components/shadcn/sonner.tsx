import React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:border-1 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl',
                    title: 'group-[.toast]:font-semibold group-[.toast]:tracking-tight',
                    description: 'group-[.toast]:text-sm group-[.toast]:mt-1 group-[.toast]:opacity-90',
                    actionButton:
                        'group-[.toast]:bg-gray-900 group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-lg group-[.toast]:hover:bg-gray-800 group-[.toast]:transition-colors',
                    cancelButton:
                        'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:font-medium group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-lg group-[.toast]:hover:bg-gray-200 group-[.toast]:transition-colors',
                    success: '!bg-gradient-to-br !from-emerald-50 !to-green-50 !border-emerald-400 !text-emerald-950',
                    error: '!bg-gradient-to-br !from-rose-50 !to-red-50 !border-rose-200 !text-red-950',
                    info: '!bg-gradient-to-br !from-sky-50 !to-blue-50 !border-sky-200 !text-sky-950',
                    warning: '!bg-gradient-to-br !from-amber-50 !to-orange-50 !border-amber-200 !text-amber-950',
                },
                style: {
                    padding: '15px',
                    gap: '14px',
                    fontSize: '15px',
                    fontWeight: '500',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
