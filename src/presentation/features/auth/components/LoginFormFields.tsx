// ============================================
// src/presentation/features/auth/components/LoginFormFields.tsx
// ============================================
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { Input, Button } from '@/src/presentation/components/ui';

interface LoginFormFieldsProps {
  emailPlaceholder: string;
  passwordPlaceholder: string;
  rememberMeText: string;
  forgotPasswordText: string;
  loginButtonText: string;
  isPending: boolean;
  defaultEmail?: string;
  formAction?: (formData: FormData) => void;
}

export function LoginFormFields({
  emailPlaceholder,
  passwordPlaceholder,
  rememberMeText,
  forgotPasswordText,
  loginButtonText,
  isPending,
  defaultEmail = '',
  formAction
}: LoginFormFieldsProps) {
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
        placeholder={emailPlaceholder}
        icon={<Mail size={18} />}
        className="text-base transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400"
      />

      <Input
        name="password"
        type="password"
        placeholder={passwordPlaceholder}
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
            {rememberMeText}
          </span>
        </label>

        <Button
          type='button'
          variant="text"
          size="sm"
          className="text-base transition-all duration-300 ease-in-out hover:text-blue-600"
        >
          {forgotPasswordText} 🤔
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
          {loginButtonText}
        </Button>
      </motion.div>
    </motion.form>
  );
}