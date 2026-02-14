// ============================================================================
// src/presentation/features/navigation/components/BrandLogo/BrandLogo.tsx
// ============================================================================
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { BrandLogoProps } from '../../types/navigation.types';

const BrandLogo: React.FC<BrandLogoProps> = ({ brandName }) => {
  const locale = useLocale();

  return (
    <motion.a
      href={`/${locale}`}
      className="text-lg font-bold text-gray-900 cursor-pointer"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
    >
      {brandName}
    </motion.a>
  );
};

export default BrandLogo;