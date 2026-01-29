/**
 * HomePage
 * @file app/[locale]/page.tsx
 * @description Main landing page with unified background and hero carousel, features, and CTA sections
 */

'use client';

import React from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import {
  HeroCarousel,
  FeaturesSection,
  CTASection,
  HomeBackground,
} from '@/src/presentation/features/home';

// ============================================
// COMPONENT
// ============================================

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      {/* Hero Carousel */}
      <div className="w-full">
        <HeroCarousel />
      </div>
      
      {/* Features Section */}
      <div className="w-full">
        <FeaturesSection />
      </div>
      
      {/* CTA Section */}
      <div className="w-full">
        <CTASection />
      </div>
    </UnifiedLayout>
  );
};

export default HomePage;