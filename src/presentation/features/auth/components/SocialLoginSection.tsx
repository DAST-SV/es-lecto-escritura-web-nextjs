// ============================================
// src/presentation/features/auth/components/SocialLoginSection.tsx
// ============================================
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  GoogleIcon,
  AppleIcon,
  FacebookIcon,
  MicrosoftIcon,
  GithubIcon,
  SocialIcon
} from '@/src/presentation/components/ui/SocialIcon';
import { loginWithProvider } from '@/src/presentation/actions/auth.actions';
import type { OAuthProvider } from '@/src/core/domain/types/Auth.types';

interface SocialLoginSectionProps {
  connectWithText: string;
  providers?: OAuthProvider[];
}

export function SocialLoginSection({
  connectWithText,
  providers = ['google', 'apple', 'facebook', 'azure', 'github']
}: SocialLoginSectionProps) {
  const t = useTranslations('auth.providers');

  const availableProviders = {
    google: {
      name: t('google'),
      color: "bg-red-500 hover:bg-red-600",
      icon: <GoogleIcon />,
    },
    apple: {
      name: t('apple'),
      color: "bg-gray-800 hover:bg-gray-900",
      icon: <AppleIcon />,
    },
    facebook: {
      name: t('facebook'),
      color: "bg-blue-600 hover:bg-blue-700",
      icon: <FacebookIcon />,
    },
    azure: {
      name: t('microsoft'),
      color: "bg-blue-500 hover:bg-blue-600",
      icon: <MicrosoftIcon />,
    },
    github: {
      name: t('github'),
      color: "bg-gray-700 hover:bg-gray-800",
      icon: <GithubIcon />,
    },
  };

  const selectedProviders = providers
    .filter(p => p in availableProviders)
    .map(p => ({
      key: p,
      ...availableProviders[p as keyof typeof availableProviders]
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      <h3
        className="text-center text-blue-600 mb-3 font-bold text-lg"
        style={{ fontFamily: "Comic Sans MS, cursive" }}
      >
        {connectWithText}
      </h3>

      <div className="flex justify-center flex-wrap gap-3">
        {selectedProviders.map((social) => (
          <motion.div
            key={social.key}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <SocialIcon
              provider={social.name}
              color={social.color}
              onClick={async () => {
                try {
                  await loginWithProvider(social.key as OAuthProvider);
                } catch (error) {
                  console.error('OAuth error:', error);
                }
              }}
              icon={social.icon}
              className="w-12 h-12 transition-all duration-300 ease-in-out"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
