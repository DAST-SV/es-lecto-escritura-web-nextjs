// ============================================
// app/[locale]/auth/reset-password/page.tsx
// Reset Password Page (after clicking email link)
// ============================================
"use client";

import { useActionState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/src/presentation/actions/auth.actions';
import type { AuthState } from '@/src/core/domain/types/Auth.types';
import { ErrorMessage, LoginBackground } from '@/src/presentation/features/auth/components';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { Input, Button } from '@/src/presentation/components/ui';
import { LocaleLink } from '@/src/presentation/components/LocaleLink';

export default function ResetPasswordPage() {
  const { t, loading } = useSupabaseTranslations('auth.form');
  const initialState: AuthState = {};
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

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
              <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto mb-6 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded animate-pulse mb-3"></div>
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
              {t('reset_password_title') || 'Nueva contraseña'}
            </h2>
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
            >
              {t('reset_password_subtitle') || 'Ingresa tu nueva contraseña'}
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
                {t('reset_password_success_title') || 'Contraseña actualizada'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t('reset_password_success_message') || 'Ya puedes iniciar sesion con tu nueva contraseña'}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LocaleLink
                  routeKey="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold hover:from-green-500 hover:to-blue-600 transition-all text-lg shadow-md"
                >
                  {t('login_button') || '¡ENTRAR A APRENDER! 📚'}
                </LocaleLink>
              </motion.div>
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
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('new_password_placeholder') || 'Nueva contraseña'}
                  icon={<Lock size={18} />}
                  showToggle={true}
                  className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('confirm_password_placeholder') || 'Confirmar contraseña'}
                  icon={<Lock size={18} />}
                  showToggle={true}
                  className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    loading={isPending}
                    loadingText={t('reset_password_loading') || 'Guardando...'}
                    className="w-full text-lg py-3 transition-all duration-300 ease-in-out"
                  >
                    {t('reset_password_submit') || 'Restablecer contraseña'}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Back to login */}
              <div className="text-center mt-5">
                <LocaleLink
                  routeKey="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}>
                    {t('back_to_login') || 'Volver al inicio de sesion'}
                  </span>
                </LocaleLink>
              </div>
            </>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
}
