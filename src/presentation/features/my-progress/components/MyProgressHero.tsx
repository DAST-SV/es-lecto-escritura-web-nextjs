// src/presentation/features/my-progress/components/MyProgressHero.tsx
/**
 * ============================================
 * COMPONENTE: MyProgressHero
 * Hero con badge, titulo y subtitulo
 * Mismo patron visual que MyWorldHero / LibraryHero
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';

// ============================================
// SKELETON
// ============================================

export const MyProgressHeroSkeleton: React.FC = memo(() => (
  <section className="relative py-10 md:py-14 lg:py-18 px-4">
    <div className="container mx-auto max-w-4xl text-center">
      <div className="flex justify-center mb-6">
        <div className="h-10 w-48 bg-white/30 rounded-full animate-pulse" />
      </div>
      <div className="flex justify-center mb-3">
        <div className="h-12 md:h-16 w-72 bg-white/30 rounded-2xl animate-pulse" />
      </div>
      <div className="flex justify-center mb-6">
        <div className="h-6 w-80 bg-white/20 rounded-xl animate-pulse" />
      </div>
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="h-1.5 w-16 bg-yellow-300/50 rounded-full animate-pulse" />
        <div className="h-1.5 w-10 bg-green-300/50 rounded-full animate-pulse" />
        <div className="h-1.5 w-6 bg-blue-300/50 rounded-full animate-pulse" />
      </div>
    </div>
  </section>
));

MyProgressHeroSkeleton.displayName = 'MyProgressHeroSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface MyProgressHeroProps {
  t: (key: string) => string;
  translationsLoading: boolean;
}

export const MyProgressHero: React.FC<MyProgressHeroProps> = memo(({ t, translationsLoading }) => {
  const badgeText = translationsLoading ? 'MI PROGRESO' : t('hero.badge');
  const titleText = translationsLoading ? 'Tu Viaje Lector' : t('hero.title');
  const subtitleText = translationsLoading ? 'Descubre como avanza tu aventura con los libros' : t('hero.subtitle');

  return (
    <section className="relative py-10 md:py-14 lg:py-18 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span
              className="text-sm font-black text-blue-700 tracking-wide"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {badgeText}
            </span>
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
        </div>

        {/* Titulo */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3"
          style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)',
          }}
        >
          {titleText}
        </h1>

        {/* Subtitulo */}
        <p
          className="text-lg md:text-xl text-white/90 font-bold mb-6"
          style={{
            fontFamily: 'Comic Sans MS, cursive',
            textShadow: '1px 1px 0px rgba(0,0,0,0.2)',
          }}
        >
          {subtitleText}
        </p>

        {/* Decoration */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-1.5 w-16 bg-yellow-300 rounded-full" />
          <div className="h-1.5 w-10 bg-green-300 rounded-full" />
          <div className="h-1.5 w-6 bg-blue-300 rounded-full" />
        </div>
      </div>
    </section>
  );
});

MyProgressHero.displayName = 'MyProgressHero';
