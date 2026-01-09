// ============================================
// src/presentation/features/auth/components/SocialLoginSection.tsx
// ============================================
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GoogleIcon, SocialIcon } from '@/src/presentation/components/ui/SocialIcon';
import { loginWithProvider } from '@/src/presentation/actions/auth.actions';

interface SocialLoginSectionProps {
  connectWithText: string;
}

export function SocialLoginSection({ connectWithText }: SocialLoginSectionProps) {
  const socialProviders = [
    {
      provider: "Google",
      color: "bg-red-500 hover:bg-red-600",
      icon: <GoogleIcon />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      <h1
        className="text-center text-blue-600 mb-3 font-bold text-xl"
        style={{ fontFamily: "Comic Sans MS, cursive" }}
      >
        {connectWithText}
      </h1>
      
      <div className="flex justify-center space-x-4">
        {socialProviders.map((social) => (
          <motion.div
            key={social.provider}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <SocialIcon
              size={14}
              provider={social.provider}
              color={social.color}
              onClick={async () => {
                await loginWithProvider(
                  social.provider.toLowerCase() as 'google'
                )
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