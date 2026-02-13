// ============================================
// app/[locale]/auth/forgot-password/page.tsx
// Forgot Password Page
// ============================================
"use client";

import { useActionState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '@/src/presentation/actions/auth.actions';
import type { AuthState } from '@/src/core/domain/types/Auth.types';
import { ErrorMessage, LoginBackground } from '@/src/presentation/features/auth/components';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { Input, Button } from '@/src/presentation/components/ui';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { t, loading } = useSupabaseTranslations('auth.form');
  const locale = useLocale();
  const initialState: AuthState = {};
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

  if (loading) {
    return (
      <UnifiedLayout
        mainClassName="flex items-center justify-center"
        className="bg-gradient-to-br from-blue-50 via-white to-blue-50"
        backgroundComponent={<LoginBackground />}
      >
        <div className="relative z-20 w-full max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="h-7 bg-gray-200 rounded-lg w-48 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-64 mx-auto mb-6 animate-pulse" />
            <div className="h-12 bg-gray-100 rounded-xl mb-4 animate-pulse" />
            <div className="h-12 bg-blue-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      mainClassName="flex items-center justify-center"
      className="bg-gradient-to-br from-blue-50 via-white to-blue-50"
      backgroundComponent={<LoginBackground />}
    >
      <div className="relative z-20 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-2xl font-bold text-gray-800 tracking-tight"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t('forgot_password_title') || '¿Olvidaste tu contraseña?'}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {t('forgot_password_subtitle') || 'Ingresa tu correo y te enviaremos un enlace para recuperarla'}
            </p>
          </div>

          {/* Success State */}
          {state.success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {t('forgot_password_success_title') || 'Revisa tu correo'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t('forgot_password_success_message') || 'Te enviamos un enlace para restablecer tu contraseña'}
              </p>
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <ArrowLeft size={16} />
                {t('back_to_login') || 'Volver al inicio de sesion'}
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Error Message */}
              <ErrorMessage error={state.error} />

              {/* Form */}
              <motion.form
                action={formAction}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-4"
              >
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('email_placeholder') || 'Correo electronico'}
                  icon={<Mail size={18} />}
                />

                <Button
                  loading={isPending}
                  loadingText={t('forgot_password_loading') || 'Enviando...'}
                  size="lg"
                  className="w-full"
                >
                  {t('forgot_password_submit') || 'Enviar enlace de recuperacion'}
                </Button>
              </motion.form>

              {/* Back to login */}
              <div className="text-center mt-5">
                <Link
                  href={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft size={14} />
                  {t('back_to_login') || 'Volver al inicio de sesion'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
}
