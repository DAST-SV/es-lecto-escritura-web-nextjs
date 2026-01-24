// ============================================
// app/[locale]/auth/register/page.tsx
// Registration Page with Supabase Translations
// ============================================
"use client";

import { useActionState, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signup } from '@/src/presentation/actions/auth.actions';
import type { AuthState } from '@/src/core/domain/types/Auth.types';
import {
  ErrorMessage,
  FormDivider,
  LoginBackground,
  RegisterFormFields,
  RoleSelector,
  SocialLoginSection,
} from '@/src/presentation/features/auth/components';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

type RoleType = 'student' | 'teacher' | 'parent' | 'school' | 'individual';

export default function RegisterPage() {
  const { t, loading } = useSupabaseTranslations('auth.register');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const initialState: AuthState = {};
  const [state, formAction, isPending] = useActionState(signup, initialState);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleBackToRoles = () => {
    setShowForm(false);
  };

  if (loading) {
    return (
      <UnifiedLayout
        mainClassName="flex items-center justify-center py-8"
        className="bg-gradient-to-b from-green-400 via-blue-300 to-purple-300"
        backgroundComponent={<LoginBackground />}
      >
        <div className="relative z-20 w-full max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-yellow-300">
            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
      className="bg-gradient-to-b from-green-400 via-blue-300 to-purple-300"
      backgroundComponent={<LoginBackground />}
    >
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-yellow-300"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-bold text-gray-700 mb-2"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              ESLECTOESCRITURA
            </h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-1">
              {t('title')}
            </h2>
            <p className="text-gray-500">
              {t('subtitle')}
            </p>
          </div>

          {/* Error Message */}
          <ErrorMessage error={state.error} />

          <AnimatePresence mode="wait">
            {!showForm ? (
              /* Step 1: Role Selection */
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Social Registration */}
                <div className="mb-6">
                  <SocialLoginSection connectWithText={t('or_continue_with')} />
                  <FormDivider text={t('divider')} />
                </div>

                {/* Role Selector */}
                <RoleSelector
                  selectedRole={selectedRole}
                  onSelectRole={handleRoleSelect}
                />

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t('already_have_account')}{' '}
                    <Link
                      href="/auth/login"
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      {t('login_link')}
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Step 2: Registration Form */
              <motion.div
                key="registration-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBackToRoles}
                  className="mb-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  ← Cambiar rol
                </button>

                {/* Selected Role Display */}
                {selectedRole && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">
                      Registrándote como:{' '}
                      <span className="font-bold text-blue-700 capitalize">
                        {selectedRole}
                      </span>
                    </p>
                  </div>
                )}

                {/* Registration Form */}
                <RegisterFormFields
                  formAction={formAction}
                  isPending={isPending}
                  selectedRole={selectedRole || undefined}
                />

                {/* Terms and Login Link */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs text-gray-500 text-center">
                    {t('terms_acceptance')}{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      {t('terms_link')}
                    </Link>{' '}
                    {t('and')}{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      {t('privacy_link')}
                    </Link>
                  </p>

                  <p className="text-sm text-gray-600 text-center">
                    {t('already_have_account')}{' '}
                    <Link
                      href="/auth/login"
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      {t('login_link')}
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
}