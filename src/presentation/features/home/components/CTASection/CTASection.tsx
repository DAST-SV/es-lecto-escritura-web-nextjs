/**
 * CTASection Component
 * @file src/presentation/features/home/components/CTASection/CTASection.tsx
 * @description CTA section matching HeroCarousel's visual style EXACTLY
 */

'use client';

import React from 'react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// SKELETON COMPONENT
// ============================================

const CTASectionSkeleton: React.FC = () => (
  <section
    className="relative flex items-center justify-center"
    style={{ height: 'calc(100vh - 60px)' }}
  >
    <div className="container mx-auto max-w-4xl relative z-10 px-4 flex flex-col items-center justify-center text-center">
      <div className="animate-pulse space-y-6 w-full">
        {/* Título */}
        <div className="space-y-3 mx-auto max-w-2xl">
          <div className="h-12 bg-white/30 rounded-2xl w-full" />
          <div className="h-12 bg-white/30 rounded-2xl w-4/5 mx-auto" />
        </div>

        {/* Decoración */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-14 bg-yellow-300/50 rounded-full" />
          <div className="h-1.5 w-8 bg-green-300/50 rounded-full" />
          <div className="h-1.5 w-5 bg-blue-300/50 rounded-full" />
        </div>

        {/* Descripción */}
        <div className="space-y-2 mx-auto max-w-xl">
          <div className="h-6 bg-white/30 rounded w-full" />
          <div className="h-6 bg-white/30 rounded w-5/6 mx-auto" />
        </div>

        {/* Button y badge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="h-14 bg-white/40 rounded-full w-60" />
          <div className="h-10 bg-white/30 rounded-full w-64" />
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/30 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const CTASection: React.FC = () => {
  const { t, loading } = useSupabaseTranslations('cta');

  if (loading) {
    return <CTASectionSkeleton />;
  }

  return (
    <section
      className="relative flex items-center justify-center"
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <div className="container mx-auto max-w-4xl relative z-10 px-4 flex flex-col items-center justify-center text-center">
        
        {/* Título MÁS COMPACTO - estilo HeroCarousel */}
        <h2 
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{
            fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
            textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
          }}
        >
          {t('title')}
        </h2>

        {/* Decoración colorida - estilo HeroCarousel */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-1.5 w-14 bg-yellow-300 rounded-full shadow-lg" />
          <div className="h-1.5 w-8 bg-green-300 rounded-full shadow-lg" />
          <div className="h-1.5 w-5 bg-blue-300 rounded-full shadow-lg" />
        </div>

        {/* Descripción */}
        <p 
          className="text-base sm:text-lg lg:text-xl text-white font-bold mb-8 leading-relaxed max-w-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          {t('description')}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button className="group relative px-8 lg:px-10 py-4 lg:py-5 bg-yellow-300 text-blue-700 font-black text-base lg:text-lg rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white overflow-hidden" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
            <span className="relative z-10">
              {t('button')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Badge de confianza */}
          <div className="flex items-center gap-2 text-white text-sm font-black bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full border-2 border-white/30 shadow-xl" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
            <span className="drop-shadow-lg">{t('trust_badge')}</span>
          </div>
        </div>

        {/* Features - estilo HeroCarousel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            { icon: '✓', key: 'feature_1' },
            { icon: '✓', key: 'feature_2' },
            { icon: '✓', key: 'feature_3' }
          ].map((feature, index) => {
            const colors = ['yellow', 'green', 'blue'];
            const colorClass = colors[index];
            
            return (
              <div 
                key={index}
                className={`group flex items-center justify-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-md rounded-xl border-2 border-${colorClass}-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
              >
                <span className="text-xl font-bold text-green-500 group-hover:scale-125 transition-transform duration-300">{feature.icon}</span>
                <span className="text-sm lg:text-base font-black text-blue-700" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
                  {t(feature.key)}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CTASection;