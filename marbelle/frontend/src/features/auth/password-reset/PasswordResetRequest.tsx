import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { Input } from '../../../shared/components/ui/input';
import { AuthWindow } from '../ui/auth-window';
import { authService } from '../services/authService';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { validationRules } from '../../../shared/lib/validation';
import { useTranslation } from 'react-i18next';

const initialValues = {
    email: '',
};

export const PasswordResetRequest: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    const validation = {
        email: [
            {
                validator: validationRules.required,
                message: t('validation.emailRequired'),
            },
            {
                validator: validationRules.email,
                message: t('validation.validEmailRequired'),
            },
        ],
    };

    const { values, errors, touched, setValue, setTouched, validateAll, reset } = useFormValidation(
        initialValues,
        validation
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateAll()) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.requestPasswordReset(values.email);
            setShowSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : t('auth.errors.resetRequestFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <AuthWindow
                success={{
                    title: t('auth.passwordReset.successTitle'),
                    message: t('auth.passwordReset.successMessage'),
                    action: (
                        <div className="space-y-6">
                            <Button
                                onClick={() => setShowSuccess(false)}
                                variant="outline"
                                className="w-full uppercase"
                            >
                                {t('auth.passwordReset.sendAnother')}
                            </Button>
                            <Button asChild className="w-full uppercase" variant="secondary">
                                <Link to="/login">{t('auth.passwordReset.backToLogin')}</Link>
                            </Button>
                        </div>
                    ),
                }}
            ></AuthWindow>
        );
    }

    return (
        <AuthWindow
            subtitle={t('auth.passwordReset.subtitle')}
            error={submitError}
            isForm={true}
            onSubmit={handleSubmit}
        >
            <div className="mb-12">
                <Input
                    id="email"
                    type="email"
                    label={t('auth.passwordReset.emailPlaceholder')}
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setTouched('email')}
                    error={errors.email && touched.email ? errors.email : undefined}
                    autoComplete="email"
                />
            </div>

            <Button type="submit" className="w-full uppercase" variant="secondary" disabled={isLoading}>
                {isLoading ? t('auth.passwordReset.submitButtonLoading') : t('auth.passwordReset.submitButton')}
            </Button>

            <Button onClick={() => navigate('/login')} variant="outline" className="w-full uppercase">
                {t('auth.passwordReset.cancel')}
            </Button>
        </AuthWindow>
    );
};
