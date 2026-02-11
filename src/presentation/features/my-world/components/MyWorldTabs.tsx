// src/presentation/features/my-world/components/MyWorldTabs.tsx
/**
 * ============================================
 * COMPONENTE: MyWorldTabs
 * Pestanas Lector / Escritor
 * Diseno pill rounded con animacion
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { BookOpen, PenTool } from 'lucide-react';
import { MyWorldTab } from '../types/my-world.types';

// ============================================
// TIPOS
// ============================================

interface MyWorldTabsProps {
  activeTab: MyWorldTab;
  onTabChange: (tab: MyWorldTab) => void;
  t: (key: string) => string;
  translationsLoading: boolean;
}

// ============================================
// COMPONENTE
// ============================================

export const MyWorldTabs: React.FC<MyWorldTabsProps> = memo(({ activeTab, onTabChange, t, translationsLoading }) => {
  const readerLabel = translationsLoading ? 'Lector' : t('tabs.reader');
  const writerLabel = translationsLoading ? 'Escritor' : t('tabs.writer');

  return (
    <div className="flex justify-center py-4 px-4">
      <div className="inline-flex bg-white/90 backdrop-blur-sm rounded-full p-1.5 border-4 border-yellow-300 shadow-xl">
        <button
          onClick={() => onTabChange('reader')}
          className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-300 ${
            activeTab === 'reader'
              ? 'bg-yellow-300 text-blue-700 scale-105 shadow-lg'
              : 'text-blue-400 hover:bg-yellow-50 hover:text-blue-600'
          }`}
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          <BookOpen className="w-5 h-5" />
          {readerLabel}
        </button>
        <button
          onClick={() => onTabChange('writer')}
          className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-300 ${
            activeTab === 'writer'
              ? 'bg-yellow-300 text-blue-700 scale-105 shadow-lg'
              : 'text-blue-400 hover:bg-yellow-50 hover:text-blue-600'
          }`}
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          <PenTool className="w-5 h-5" />
          {writerLabel}
        </button>
      </div>
    </div>
  );
});

MyWorldTabs.displayName = 'MyWorldTabs';
