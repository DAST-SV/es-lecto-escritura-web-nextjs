/**
 * CTASection Component
 * @file src/presentation/features/home/components/CTASection/CTASection.tsx
 * @description Call-to-action section for the home page with dynamic Supabase translations
 */

'use client';

import React from 'react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// COMPONENT
// ============================================

export const CTASection: React.FC = () => {
  const { t, hasTranslation, loading } = useSupabaseTranslations('cta');

  // Get translations dynamically
  const title = t('title');
  const description = t('description');
  const buttonText = t('button');

  // Check if translations are loaded
  const isLoaded = hasTranslation('title');

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading || !isLoaded) {
    return (
      <section className="py-16 px-8 md:px-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            {/* Title Skeleton - 2 lines to match real title */}
            <div className="space-y-3">
              <div className="h-9 md:h-10 bg-gray-200/60 rounded-lg w-3/4 mx-auto animate-pulse" />
              <div className="h-9 md:h-10 bg-gray-200/60 rounded-lg w-2/3 mx-auto animate-pulse" />
            </div>
            
            {/* Description Skeleton - 3 lines to match paragraph */}
            <div className="space-y-3">
              <div className="h-6 md:h-7 bg-gray-100/60 rounded w-5/6 mx-auto animate-pulse" />
              <div className="h-6 md:h-7 bg-gray-100/60 rounded w-4/5 mx-auto animate-pulse" />
              <div className="h-6 md:h-7 bg-gray-100/60 rounded w-3/4 mx-auto animate-pulse" />
            </div>
            
            {/* Button Skeleton - exact dimensions */}
            <div className="flex justify-center">
              <div className="h-14 w-52 bg-gradient-to-r from-orange-400/40 to-red-400/40 rounded-xl animate-pulse shadow-lg" />
            </div>
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
          {title}
        </h3>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-lg">
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CTASection;