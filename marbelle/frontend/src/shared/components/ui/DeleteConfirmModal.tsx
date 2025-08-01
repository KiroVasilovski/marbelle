import React from 'react';
import { Button } from '../shadcn/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../shadcn/dialog';

export interface DeleteConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    itemPreview?: React.ReactNode;
    warning?: string;
    destructiveWarning?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    itemPreview,
    warning,
    destructiveWarning,
    onConfirm,
    onCancel,
    isLoading = false,
    confirmText = 'DELETE',
    cancelText = 'CANCEL',
}) => {
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onOpenChange(false);
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                        <span className="text-xl font-medium tracking-wide text-neutral-900 uppercase">{title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-neutral-700 tracking-wide">{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Item Preview */}
                    {itemPreview && (
                        <div className="bg-neutral-50 rounded border border-neutral-200 p-4">{itemPreview}</div>
                    )}

                    {/* Warning */}
                    {warning && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-yellow-800 text-sm tracking-wide uppercase">{warning}</p>
                        </div>
                    )}

                    {/* Destructive Warning */}
                    {destructiveWarning && (
                        <p className="text-sm text-neutral-600 tracking-wide">{destructiveWarning}</p>
                    )}
                </div>

                <DialogFooter className="gap-4">
                    <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button variant="delete" onClick={handleConfirm} disabled={isLoading} className="min-w-[100px]">
                        {isLoading ? 'DELETING...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
