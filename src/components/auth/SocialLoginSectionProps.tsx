"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AppleIcon, FacebookIcon, GoogleIcon, MicrosoftIcon, SocialIcon, SpotifyIcon, TwitterIcon } from '@/src/components/ui/SocialIcon';
import { loginWithProvider } from '@/src/utils/supabase/actions/auth';

interface SocialLoginSectionProps {
  connectWithText: string;
}

const SocialLoginSection: React.FC<SocialLoginSectionProps> = ({ connectWithText }) => {
  const socialProviders = [
    {
      provider: "Google",
      color: "bg-red-500 hover:bg-red-600",
      icon: <GoogleIcon />,
    },
    // {
    //   provider: "Apple",
    //   color: "bg-black hover:bg-gray-900",
    //   icon: <AppleIcon />,
    // },
    // {
    //   provider: "Microsoft",
    //   color: "bg-white border border-gray-300 hover:bg-gray-100",
    //   icon: <MicrosoftIcon />,
    // },
    // {
    //   provider: "Facebook",
    //   color: "bg-blue-600 hover:bg-blue-700",
    //   icon: <FacebookIcon />,
    // },
    // {
    //   provider: "Twitter",
    //   color: "bg-sky-400 hover:bg-sky-500",
    //   icon: <TwitterIcon />,
    // },
    // {
    //   provider: "Spotify",
    //   color: "bg-green-500 hover:bg-green-600",
    //   icon: <SpotifyIcon />,
    // },
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
                  social.provider.toLowerCase() as 'google' | 'apple' | 'azure' | 'facebook' | 'twitter' | 'spotify',
                  window.location.origin
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
};

export default SocialLoginSection;