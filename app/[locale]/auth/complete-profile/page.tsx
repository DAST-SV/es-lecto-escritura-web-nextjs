// ============================================
// app/[locale]/auth/complete-profile/page.tsx
// Complete Profile Page - Assign role after OAuth signup
// ============================================
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LoginBackground,
  RoleSelector,
} from '@/src/presentation/features/auth/components';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { Button } from '@/src/presentation/components/ui';
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-3 border-yellow-300">
            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 border-3 border-yellow-300"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-gray-700 text-xl mb-2"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              ESLECTOESCRITURA
            </h1>
            <h2
              className="text-blue-600 font-bold text-xl mb-1"
              style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
            >
              {t('complete_profile_title') || '¡Bienvenido! Completa tu perfil'}
            </h2>
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
            >
              {t('complete_profile_subtitle') || 'Selecciona tu tipo de usuario para continuar'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <RoleSelector
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
          />

          {/* Submit Button */}
          <motion.div
            className="mt-6"
            whileHover={{ scale: selectedRole ? 1.05 : 1 }}
            whileTap={{ scale: selectedRole ? 0.95 : 1 }}
          >
            <Button
              onClick={handleSubmit}
              loading={isPending}
              loadingText={t('complete_profile_loading') || 'Guardando...'}
              disabled={!selectedRole}
              className="w-full text-lg py-3 transition-all duration-300 ease-in-out"
            >
              {t('complete_profile_submit') || '¡Empezar a aprender! 🚀'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
}
