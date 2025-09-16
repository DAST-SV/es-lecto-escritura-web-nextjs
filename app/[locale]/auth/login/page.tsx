'use client';

import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { AuthState, login } from '@/src/utils/supabase/actions/auth';
import LoginBackground from '@/src/components/auth/LoginBackground';
import ErrorMessage from '@/src/components/auth/ErrorMessage';
import SocialLoginSection from '@/src/components/auth/SocialLoginSectionProps';
import FormDivider from '@/src/components/auth/FormDivider';
import LoginFormFields from '@/src/components/auth/LoginFormFields';

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
            <SocialLoginSection connectWithText={t('form.connect_with')} />

            {/* Form Divider */}
            <FormDivider text={t('form.or_use_email')} />
          </div>

          {/* Form Fields with action */}
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