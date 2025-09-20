"use client";
import React from 'react';
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import HeroCarousel from '@/src/components/sections/public/HeroCarousel';
import FeaturesSection from '@/src/components/sections/public/FeaturesSection';
import CTASection from '@/src/components/sections/public/CTASection';

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout className="bg-gradient-to-r bg-[#39cffd]" mainClassName="pt-0">
      <HeroCarousel />
      <FeaturesSection />
      <CTASection />
    </UnifiedLayout>
  );
};

export default HomePage;