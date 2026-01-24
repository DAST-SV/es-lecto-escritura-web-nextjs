// ============================================
// src/presentation/features/auth/components/LoginFormFields.tsx
// Component: Login Form Fields con traducciones de Supabase
// ============================================
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { Input, Button } from '@/src/presentation/components/ui';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface LoginFormFieldsProps {
  isPending: boolean;
  defaultEmail?: string;
  formAction?: (formData: FormData) => void;
}

export function LoginFormFields({
  isPending,
  defaultEmail = '',
  formAction
}: LoginFormFieldsProps) {
  const { t, loading } = useSupabaseTranslations('auth.form');

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
        <div className="flex items-center justify-between py-2">
          <div className="h-5 bg-gray-100 rounded w-24 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="space-y-5"
    >
      <Input
        name="email"
        type="email"
        defaultValue={defaultEmail}
        placeholder={t('email_placeholder')}
        icon={<Mail size={18} />}
        className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
      />

      <Input
        name="password"
        type="password"
        placeholder={t('password_placeholder')}
        icon={<Lock size={18} />}
        showToggle={true}
        className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex items-center justify-between py-2">
        <label className="flex items-center group cursor-pointer text-base transition-all duration-300 ease-in-out hover:scale-105">
          <input
            type="checkbox"
            name="rememberMe"
            className="h-4 w-4 text-green-500 focus:ring-green-400 border-2 border-green-400 rounded transition-all duration-300"
          />
          <span
            className="ml-3 text-green-600 font-bold"
            style={{ fontFamily: "Comic Sans MS, cursive" }}
          >
            {t('remember_me')}
          </span>
        </label>

        <Button
          type='button'
          variant="text"
          size="sm"
          className="text-base transition-all duration-300 ease-in-out hover:text-blue-600"
        >
          {t('forgot_password')} 🤔
        </Button>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          loading={isPending}
          className="w-full text-lg py-3 mt-5 transition-all duration-300 ease-in-out"
        >
          {t('login_button')}
        </Button>
      </motion.div>
    </motion.form>
  );
}