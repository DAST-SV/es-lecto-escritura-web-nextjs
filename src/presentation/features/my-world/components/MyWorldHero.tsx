// src/presentation/features/my-world/components/MyWorldHero.tsx
/**
 * ============================================
 * COMPONENTE: MyWorldHero
 * Hero section con stats personales
 * Mismo patron visual que LibraryHero
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import { Globe, BookOpen, CheckCircle, Heart, PenTool } from 'lucide-react';
import { MyWorldStats } from '@/src/infrastructure/repositories/my-world/MyWorldRepository';

// ============================================
// SKELETON
// ============================================

export const MyWorldHeroSkeleton: React.FC = memo(() => (
  <section className="relative py-10 md:py-14 lg:py-18 px-4">
    <div className="container mx-auto max-w-4xl text-center">
      {/* Badge skeleton */}
      <div className="flex justify-center mb-6">
        <div className="h-10 w-56 bg-white/30 rounded-full animate-pulse" />
      </div>

      {/* Title skeleton */}
      <div className="flex justify-center mb-3">
        <div className="h-12 md:h-16 w-80 bg-white/30 rounded-2xl animate-pulse" />
      </div>

      {/* Subtitle skeleton */}
      <div className="flex justify-center mb-6">
        <div className="h-6 w-64 bg-white/20 rounded-xl animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-32 bg-white/20 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Decoration */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <div className="h-1.5 w-16 bg-yellow-300/50 rounded-full animate-pulse" />
        <div className="h-1.5 w-10 bg-green-300/50 rounded-full animate-pulse" />
        <div className="h-1.5 w-6 bg-blue-300/50 rounded-full animate-pulse" />
      </div>
    </div>
  </section>
));

MyWorldHeroSkeleton.displayName = 'MyWorldHeroSkeleton';

// ============================================
// STAT PILL
// ============================================

interface StatPillProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

const StatPill: React.FC<StatPillProps> = memo(({ icon, value, label, colorBg, colorText, colorBorder }) => (
  <div className={`flex items-center gap-2 px-4 py-2 ${colorBg} backdrop-blur-sm rounded-full shadow-lg border-2 ${colorBorder}`}>
    <div className={`${colorText}`}>{icon}</div>
    <span className={`text-sm font-black ${colorText}`} style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
      {value}
    </span>
    <span className={`text-xs font-bold ${colorText} opacity-80`} style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
      {label}
    </span>
  </div>
));

StatPill.displayName = 'StatPill';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface MyWorldHeroProps {
  stats: MyWorldStats;
  t: (key: string) => string;
  translationsLoading?: boolean;
}

export const MyWorldHero: React.FC<MyWorldHeroProps> = memo(({ stats, t, translationsLoading = false }) => {
  const badgeText = translationsLoading ? 'MI MUNDO PERSONAL' : t('hero.badge');
  const titleText = translationsLoading ? 'Bienvenido a tu Mundo' : t('hero.title');
  const subtitleText = translationsLoading ? 'Tu espacio personal de lectura y escritura' : t('hero.subtitle');
  const inProgressLabel = translationsLoading ? 'En progreso' : t('stats.in_progress');
  const completedLabel = translationsLoading ? 'Completados' : t('stats.completed');
  const favoritesLabel = translationsLoading ? 'Favoritos' : t('stats.favorites');
  const authoredLabel = translationsLoading ? 'Escritos' : t('stats.authored');

  return (
    <section className="relative py-10 md:py-14 lg:py-18 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <Globe className="w-5 h-5 text-blue-600" />
            <span
              className="text-sm font-black text-blue-700 tracking-wide"
              style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
            >
              {badgeText}
            </span>
          </div>
        </div>

        {/* Titulo */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3"
          style={{
            fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
            textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)',
          }}
        >
          {titleText}
        </h1>

        {/* Subtitulo */}
        <p
          className="text-lg md:text-xl text-white/90 font-bold mb-8"
          style={{
            fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
            textShadow: '1px 1px 0px rgba(0,0,0,0.2)',
          }}
        >
          {subtitleText}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <StatPill
            icon={<BookOpen className="w-4 h-4" />}
            value={stats.booksInProgress}
            label={inProgressLabel}
            colorBg="bg-yellow-100/95"
            colorText="text-yellow-700"
            colorBorder="border-yellow-300"
          />
          <StatPill
            icon={<CheckCircle className="w-4 h-4" />}
            value={stats.booksCompleted}
            label={completedLabel}
            colorBg="bg-green-100/95"
            colorText="text-green-700"
            colorBorder="border-green-300"
          />
          <StatPill
            icon={<Heart className="w-4 h-4" />}
            value={stats.totalFavorites}
            label={favoritesLabel}
            colorBg="bg-pink-100/95"
            colorText="text-pink-700"
            colorBorder="border-pink-300"
          />
          <StatPill
            icon={<PenTool className="w-4 h-4" />}
            value={stats.totalAuthored}
            label={authoredLabel}
            colorBg="bg-purple-100/95"
            colorText="text-purple-700"
            colorBorder="border-purple-300"
          />
        </div>

        {/* Decoration */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="h-1.5 w-16 bg-yellow-300 rounded-full" />
          <div className="h-1.5 w-10 bg-green-300 rounded-full" />
          <div className="h-1.5 w-6 bg-blue-300 rounded-full" />
        </div>
      </div>
    </section>
  );
});

MyWorldHero.displayName = 'MyWorldHero';
