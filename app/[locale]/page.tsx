"use client";
import React from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200" mainClassName="pt-0">
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