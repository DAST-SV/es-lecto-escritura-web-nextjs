/**
 * HomePage
 * @file app/[locale]/page.tsx
 * @description Main landing page with hero carousel, features, and CTA sections
 */

'use client';

import React from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import {
  HeroCarousel,
  FeaturesSection,
  CTASection,
} from '@/src/presentation/features/home';

// ============================================
// COMPONENT
// ============================================

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout
      className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
    >
      {/* Hero Carousel - con loading state interno */}
      <div className="w-full">
        <HeroCarousel />
      </div>
      
      {/* Features Section - con loading state interno */}
      <div className="w-full">
        <FeaturesSection />
      </div>
      
      {/* CTA Section - con loading state interno */}
      <div className="w-full">
        <CTASection />
      </div>
    </UnifiedLayout>
  );
};

export default HomePage;