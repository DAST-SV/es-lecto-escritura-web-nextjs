// ============================================
// src/presentation/features/auth/components/FormDivider.tsx
// ============================================
"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FormDividerProps {
  text: string;
}

export function FormDivider({ text }: FormDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="relative mb-6"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-yellow-400"></div>
      </div>
      <div className="relative flex justify-center text-base">
        <span
          className="px-4 bg-white text-orange-500 font-bold"
          style={{ fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" }}
        >
          {text}
        </span>
      </div>
    </motion.div>
  );
}