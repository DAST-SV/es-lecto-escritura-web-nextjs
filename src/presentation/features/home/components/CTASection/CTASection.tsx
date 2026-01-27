/**
 * CTASection Component
 * @file src/presentation/features/home/components/CTASection/CTASection.tsx
 * @description Call-to-action section for the home page
 */

'use client';

import React from 'react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_CONTENT = {
  title: 'Ready to Start Learning?',
  description: 'Join thousands of students who are improving their reading and writing skills every day.',
  button: 'Get Started Now',
};

// ============================================
// COMPONENT
// ============================================

export const CTASection: React.FC = () => {
  const { t } = useSupabaseTranslations('cta');

  // Get translations with fallbacks
  const title = t('title');
  const description = t('description');
  const buttonText = t('button');

  // Use fallbacks if translations not loaded
  const displayTitle = title.startsWith('[') ? DEFAULT_CONTENT.title : title;
  const displayDescription = description.startsWith('[') ? DEFAULT_CONTENT.description : description;
  const displayButton = buttonText.startsWith('[') ? DEFAULT_CONTENT.button : buttonText;

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="py-16 px-8 md:px-16 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
          {displayTitle}
        </h3>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {displayDescription}
        </p>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-lg">
          {displayButton}
        </button>
      </div>
    </section>
  );
};

export default CTASection;
