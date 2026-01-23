// ============================================================================
// src/presentation/features/navigation/components/NavigationItems/NavigationItems.tsx
// ============================================================================
"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavigationItemsProps } from '../../types/navigation.types';

const NavigationItems: React.FC<NavigationItemsProps> = ({
  items,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="px-4 py-2 rounded-lg bg-white shadow-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </>
    );
  }

  return (
    <>
      {items.map((item, index) => (
        <motion.a
          key={index}
          href={item.href}
          className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item.label}
        </motion.a>
      ))}
    </>
  );
};

export default NavigationItems;