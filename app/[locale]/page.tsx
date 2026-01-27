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
      className="bg-gradient-to-r bg-[#39cffd]"
      mainClassName="pt-0"
    >
      <HeroCarousel />
      <FeaturesSection />
      <CTASection />
    </UnifiedLayout>
  );
};

export default HomePage;
