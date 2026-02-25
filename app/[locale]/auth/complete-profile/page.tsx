// ============================================
// app/[locale]/auth/complete-profile/page.tsx
// Complete Profile Page - Assign role after OAuth signup
// ✅ Redesigned: Modern style matching homepage
// ============================================
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LoginBackground,
  RoleSelector,
} from '@/src/presentation/features/auth/components';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { assignRole } from '@/src/presentation/actions/auth.actions';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

type RoleType = 'student' | 'teacher' | 'parent' | 'school' | 'individual';

export default function CompleteProfilePage() {
  const { t, loading: transLoading } = useSupabaseTranslations('auth.form');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setIsPending(true);
    setError(null);

    try {
      const result = await assignRole(selectedRole);
      if (result.error) {
        setError(result.error);
        setIsPending(false);
      } else {
        router.push(redirectTo || `/${locale}/library`);
      }
    } catch (err) {
      setError('Error al asignar el rol');
      setIsPending(false);
    }
  };

  if (transLoading) {
    return (
      <UnifiedLayout
        mainClassName="flex items-center justify-center py-8"
        className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300"
        backgroundComponent={<LoginBackground />}
      >
        <div className="relative z-20 w-full max-w-2xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-yellow-300">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full animate-pulse" />
            </div>
            <div className="h-8 bg-yellow-100 rounded-full w-2/3 mx-auto mb-3 animate-pulse" />
            <div className="h-5 bg-blue-50 rounded-full w-1/2 mx-auto mb-8 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-blue-50 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="mt-6 h-14 bg-yellow-100 rounded-full animate-pulse" />
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      mainClassName="flex items-center justify-center py-8"
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300"
      backgroundComponent={<LoginBackground />}
    >
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-yellow-300"
        >
          {/* Header con icono */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center border-3 border-white shadow-lg"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <span className="text-4xl">👋</span>
              </motion.div>
            </div>
            <h1
              className="text-blue-700 font-black text-2xl sm:text-3xl mb-2"
              style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
            >
              {t('complete_profile_title') || '¡Bienvenido!'}
            </h1>
            <p
              className="text-blue-500 font-bold text-sm sm:text-base"
              style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
            >
              {t('complete_profile_subtitle') || 'Selecciona tu tipo de usuario para continuar'}
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-bold text-center"
                style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Selector */}
          <RoleSelector
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
          />

          {/* Submit Button */}
          <motion.div className="mt-6">
            <motion.button
              onClick={handleSubmit}
              disabled={!selectedRole || isPending}
              className={`
                w-full py-4 rounded-full text-lg font-black border-2 border-white
                shadow-2xl transition-all duration-300
                ${selectedRole && !isPending
                  ? 'bg-yellow-300 text-blue-700 hover:shadow-yellow-400/50 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
              style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
              whileHover={selectedRole && !isPending ? { scale: 1.02 } : {}}
              whileTap={selectedRole && !isPending ? { scale: 0.95 } : {}}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {t('complete_profile_loading') || 'Guardando...'}
                </span>
              ) : (
                t('complete_profile_submit') || '¡Empezar a aprender! 🚀'
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
}
