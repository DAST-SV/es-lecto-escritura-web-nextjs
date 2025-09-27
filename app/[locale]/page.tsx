"use client";
import React from 'react';
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import HeroCarousel from '@/src/components/sections/public/HeroCarousel';
import FeaturesSection from '@/src/components/sections/public/FeaturesSection';
import CTASection from '@/src/components/sections/public/CTASection';

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout className="bg-gradient-to-br from-[#39cffd] to-[#2eb8e6] min-h-screen" mainClassName="pt-0">
      {/* Hero Carousel - Altura responsiva mejorada */}
      <div className="w-full">
        <HeroCarousel />
      </div>
      
      {/* Features Section - Espaciado responsivo */}
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