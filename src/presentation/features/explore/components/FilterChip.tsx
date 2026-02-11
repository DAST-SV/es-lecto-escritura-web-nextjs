/**
 * ============================================
 * COMPONENTE: FilterChip
 * Chip individual para filtros seleccionables
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { Check } from 'lucide-react';

// ============================================
// TIPOS
// ============================================

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  colorScheme?: 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';
  size?: 'sm' | 'md';
  count?: number;
}

// ============================================
// ESTILOS POR COLOR
// ============================================

const COLOR_SCHEMES = {
  yellow: {
    base: 'border-yellow-300 hover:border-yellow-400',
    selected: 'bg-yellow-300 border-yellow-400 text-yellow-900',
    unselected: 'bg-white text-yellow-700 hover:bg-yellow-50',
  },
  green: {
    base: 'border-green-300 hover:border-green-400',
    selected: 'bg-green-300 border-green-400 text-green-900',
    unselected: 'bg-white text-green-700 hover:bg-green-50',
  },
  blue: {
    base: 'border-blue-300 hover:border-blue-400',
    selected: 'bg-blue-300 border-blue-400 text-blue-900',
    unselected: 'bg-white text-blue-700 hover:bg-blue-50',
  },
  pink: {
    base: 'border-pink-300 hover:border-pink-400',
    selected: 'bg-pink-300 border-pink-400 text-pink-900',
    unselected: 'bg-white text-pink-700 hover:bg-pink-50',
  },
  purple: {
    base: 'border-purple-300 hover:border-purple-400',
    selected: 'bg-purple-300 border-purple-400 text-purple-900',
    unselected: 'bg-white text-purple-700 hover:bg-purple-50',
  },
  orange: {
    base: 'border-orange-300 hover:border-orange-400',
    selected: 'bg-orange-300 border-orange-400 text-orange-900',
    unselected: 'bg-white text-orange-700 hover:bg-orange-50',
  },
};

const SIZES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

// ============================================
// COMPONENTE
// ============================================

export const FilterChip: React.FC<FilterChipProps> = memo(
  ({ label, isSelected, onToggle, colorScheme = 'blue', size = 'md', count }) => {
    const colors = COLOR_SCHEMES[colorScheme];
    const sizeClasses = SIZES[size];

    return (
      <button
        type="button"
        onClick={onToggle}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-bold
          border-2 transition-all duration-200 shadow-sm
          hover:shadow-md active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
          ${sizeClasses}
          ${colors.base}
          ${isSelected ? colors.selected : colors.unselected}
        `}
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        aria-pressed={isSelected}
      >
        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span
            className={`
              ml-0.5 px-1.5 rounded-full text-xs font-bold
              ${isSelected ? 'bg-white/50' : 'bg-gray-100'}
            `}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);

FilterChip.displayName = 'FilterChip';

export default FilterChip;
