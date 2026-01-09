// ============================================
// app/[locale]/auth/login/page.tsx
// ✅ CORREGIDO: Imports desde arquitectura limpia
// ============================================
'use client';

import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { 
  LoginBackground,
  ErrorMessage,
  SocialLoginSection,
  FormDivider,
  LoginFormFields 
} from '@/src/presentation/features/auth/components';

export default function LoginPage() {
  const t = useTranslations('auth');
  const initialState: AuthState = {};
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <UnifiedLayout
      mainClassName="flex items-center justify-center"
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300"
      backgroundComponent={<LoginBackground />}
    >
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 border-3 border-yellow-300">
          <div className="text-center mb-4">
            <h1 
              className="text-gray-700" 
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              ESLECTOESCRITURA
            </h1>

            <ErrorMessage error={state.error} />
            <SocialLoginSection connectWithText={t('form.connect_with')} />
            <FormDivider text={t('form.or_use_email')} />
          </div>

          <LoginFormFields
            emailPlaceholder={t('form.email_placeholder')}
            passwordPlaceholder={t('form.password_placeholder')}
            rememberMeText={t('form.remember_me')}
            forgotPasswordText={t('form.forgot_password')}
            loginButtonText={t('form.login_button')}
            isPending={isPending}
            defaultEmail={state.email}
            formAction={formAction}
          />
        </div>
      </div>
    </UnifiedLayout>
  );
}