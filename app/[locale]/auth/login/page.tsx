// ============================================
// app/[locale]/auth/login/page.tsx
// ✅ CORREGIDO: Imports agregados
// ============================================
"use client";

import { useActionState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { login } from '@/src/presentation/actions/auth.actions';
import type { AuthState } from '@/src/core/domain/types/Auth.types'; // ✅ Import agregado
import {
  ErrorMessage,
  FormDivider,
  LoginBackground,
  LoginFormFields,
  SocialLoginSection,
} from '@/src/presentation/features/auth/components';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const initialState: AuthState = {}; // ✅ Uso correcto de AuthState
  const [state, formAction, isPending] = useActionState(login, initialState); // ✅ login importado

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 overflow-hidden px-4">
      <LoginBackground />

      <motion.div
        className="relative bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md z-10"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      >
        <motion.h1
          className="text-center text-blue-600 mb-4 font-black text-2xl tracking-wider"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          {t('title')} 🎉
        </motion.h1>

        <ErrorMessage error={state.error} />

        <SocialLoginSection connectWithText={t('connectWith')} />

        <FormDivider text={t('or')} />

        <LoginFormFields
          emailPlaceholder={t('emailPlaceholder')}
          passwordPlaceholder={t('passwordPlaceholder')}
          rememberMeText={t('rememberMe')}
          forgotPasswordText={t('forgotPassword')}
          loginButtonText={t('loginButton')}
          isPending={isPending}
          defaultEmail={state.email}
          formAction={formAction}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-gray-600 mt-6 text-base"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          {t('noAccount')}{' '}
          <a href="/auth/register" className="text-blue-600 font-bold hover:underline">
            {t('registerHere')}
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}