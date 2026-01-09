// ============================================================================
// src/presentation/features/navigation/components/NavBar/MobileToggleButton.tsx
// ============================================================================
"use client";

import React from 'react';
import { Menu, X } from 'lucide-react';
import { MobileToggleButtonProps } from '../../types/navigation.types';

const MobileToggleButton: React.FC<MobileToggleButtonProps> = ({ 
  isOpen, 
  onToggle 
}) => {
  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={onToggle}
        aria-label="Toggle menu"
        className="text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>
  );
};

export default MobileToggleButton;