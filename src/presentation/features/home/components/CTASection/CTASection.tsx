/**
 * CTASection Component
 * @file src/presentation/features/home/components/CTASection/CTASection.tsx
 * @description Call-to-action section for the home page
 */

'use client';

import React from 'react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// COMPONENT
// ============================================

export const CTASection: React.FC = () => {
  const { t, loading } = useSupabaseTranslations('cta');

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <section className="py-16 px-8 md:px-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-12 w-48 bg-gray-200 rounded-xl mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="py-16 px-8 md:px-16 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
          {t('title')}
        </h3>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {t('description')}
        </p>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-lg">
          {t('button')}
        </button>
      </div>
    </section>
  );
};

export default CTASection;
