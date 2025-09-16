"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  brandName: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ brandName }) => {
  return (
    <motion.a
      href="/"
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