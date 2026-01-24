// ============================================
// app/[locale]/auth/login/page.tsx
// Login Page with Supabase Translations
// ============================================
"use client";

import { useActionState } from 'react';
import { login } from '@/src/presentation/actions/auth.actions';
import type { AuthState } from '@/src/core/domain/types/Auth.types';
import {
  ErrorMessage,
  FormDivider,
  LoginBackground,
  LoginFormFields,
  SocialLoginSection,
} from '@/src/presentation/features/auth/components';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

export default function LoginPage() {
  const { t, loading } = useSupabaseTranslations('auth.form');
  const initialState: AuthState = {};
  const [state, formAction, isPending] = useActionState(login, initialState);

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
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
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
          <div className="text-center mb-4">
            {/* Brand Title */}
            <h1 
              className="text-gray-700" 
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              ESLECTOESCRITURA
            </h1>

            {/* Error Message */}
            <ErrorMessage error={state.error} />

            {/* Social Login Section */}
            <SocialLoginSection connectWithText={t('connect_with')} />

            {/* Form Divider */}
            <FormDivider text={t('or_use_email')} />
          </div>

          {/* Form Fields with action */}
          <LoginFormFields
            isPending={isPending}
            defaultEmail={state.email}
            formAction={formAction}
          />
        </div>
      </div>
    </UnifiedLayout>
  );
}