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
        className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300"
        backgroundComponent={<LoginBackground />}
      >
        <div className="relative z-20 w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-4 border-3 border-yellow-300">
            <div className="text-center mb-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto mb-6 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded animate-pulse mb-4"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      mainClassName="flex items-center justify-center"
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300"
      backgroundComponent={<LoginBackground />}
    >
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 border-3 border-yellow-300">
          {/* Header */}
          <div className="text-center mb-4">
            <h1
              className="text-gray-700 text-xl mb-2"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              ESLECTOESCRITURA
            </h1>
            <h2
              className="text-blue-600 font-bold text-lg mb-1"
              style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
            >
              {t('forgot_password_title') || '¿Olvidaste tu contraseña?'}
            </h2>
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
            >
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
              <h2
                className="text-lg font-bold text-green-600 mb-1"
                style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
              >
                {t('forgot_password_success_title') || 'Revisa tu correo'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t('forgot_password_success_message') || 'Te enviamos un enlace para restablecer tu contraseña'}
              </p>
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors border border-yellow-300 rounded-lg px-4 py-2 hover:bg-yellow-50"
                style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-5"
              >
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('email_placeholder') || 'Tu correo electronico'}
                  icon={<Mail size={18} />}
                  className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    loading={isPending}
                    loadingText={t('forgot_password_loading') || 'Enviando...'}
                    className="w-full text-lg py-3 transition-all duration-300 ease-in-out"
                  >
                    {t('forgot_password_submit') || 'Enviar enlace de recuperacion'}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Back to login */}
              <div className="text-center mt-5">
                <Link
                  href={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
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
