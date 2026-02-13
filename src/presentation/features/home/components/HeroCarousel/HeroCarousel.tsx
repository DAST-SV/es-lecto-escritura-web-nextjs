/**
 * HeroCarousel Component
 * @file src/presentation/features/home/components/HeroCarousel/HeroCarousel.tsx
 * @description Hero carousel with vibrant design, optimized performance, and professional skeleton loading
 */

'use client';

import React, { useCallback, useEffect, useState, useRef, useMemo, memo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

import type { HeroSlide } from '../../types';
import { NextImage } from '@/src/presentation/components/ui/NextImage';
import { imagesConfig } from '@/src/infrastructure/config/images.config';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// CONSTANTS
// ============================================

const SLIDE_IMAGES = [
  imagesConfig.literacy.v1,
  imagesConfig.stories.v1,
  imagesConfig.fables.v1,
  imagesConfig.poems.v1,
  imagesConfig.legends.v1,
  imagesConfig.dashboard.riddlesV1,
  imagesConfig.comics.v1,
  imagesConfig.tongueTwisters.v1,
  imagesConfig.rhymes.v1,
] as const;

const SLIDE_ROUTES = [
  '/explorar',
  '/categoria/cuentos',
  '/categoria/fabulas',
  '/categoria/poemas',
  '/categoria/leyendas',
  '/categoria/adivinanzas',
  '/categoria/historietas',
  '/categoria/trabalenguas',
  '/categoria/refranes',
] as const;

const AUTOPLAY_CONFIG = {
  delay: 6000,
  stopOnInteraction: true,
  stopOnMouseEnter: true,
  stopOnFocusIn: true,
} as const;

const EMBLA_CONFIG = {
  loop: true,
  duration: 30,
  skipSnaps: false,
  dragFree: false,
} as const;

// ============================================
// SKELETON COMPONENT
// ============================================

const CarouselSkeleton: React.FC = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* DESKTOP Skeleton (1280px+) */}
      <div className="hidden xl:flex w-full max-w-5xl items-center justify-between gap-8 mx-auto">
        {/* Left Content */}
        <div className="w-[50%] space-y-4 animate-pulse">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full w-52 h-8"></div>
          <div className="space-y-3">
            <div className="h-10 bg-white/30 rounded-lg w-full"></div>
            <div className="h-10 bg-white/30 rounded-lg w-4/5"></div>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-1.5 w-16 bg-yellow-300/50 rounded-full" />
              <div className="h-1.5 w-10 bg-green-300/50 rounded-full" />
              <div className="h-1.5 w-6 bg-blue-300/50 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-5 bg-white/30 rounded w-full"></div>
            <div className="h-5 bg-white/30 rounded w-11/12"></div>
            <div className="h-5 bg-white/30 rounded w-9/12"></div>
          </div>
          <div className="h-12 bg-white/40 rounded-full w-48 mt-4"></div>
        </div>
        <div className="w-[50%] flex justify-end items-end">
          <div className="relative bg-white/30 rounded-3xl p-3 w-[350px] h-[350px] animate-pulse">
            <div className="rounded-2xl bg-white/20 w-full h-full"></div>
          </div>
        </div>
      </div>

      {/* LAPTOP Skeleton (1024-1279px) */}
      <div className="hidden lg:flex xl:hidden w-full max-w-4xl items-center justify-between gap-8 mx-auto">
        <div className="w-[50%] space-y-3 animate-pulse">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full w-52 h-8"></div>
          <div className="space-y-3">
            <div className="h-9 bg-white/30 rounded-lg w-full"></div>
            <div className="h-9 bg-white/30 rounded-lg w-4/5"></div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-14 bg-yellow-300/50 rounded-full" />
              <div className="h-1.5 w-8 bg-green-300/50 rounded-full" />
              <div className="h-1.5 w-5 bg-blue-300/50 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-white/30 rounded w-full"></div>
            <div className="h-4 bg-white/30 rounded w-11/12"></div>
            <div className="h-4 bg-white/30 rounded w-9/12"></div>
          </div>
          <div className="h-11 bg-white/40 rounded-full w-44 mt-4"></div>
        </div>
        <div className="w-[50%] flex justify-end items-end">
          <div className="relative bg-white/30 rounded-3xl p-3 w-[300px] h-[300px] animate-pulse">
            <div className="rounded-2xl bg-white/20 w-full h-full"></div>
          </div>
        </div>
      </div>

      {/* TABLET Skeleton (768-1023px) */}
      <div className="hidden md:flex lg:hidden w-full max-w-3xl flex-col items-center text-center space-y-4 mx-auto px-6">
        <div className="space-y-3 animate-pulse w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full w-52 h-8 mx-auto"></div>
          <div className="h-9 bg-white/30 rounded-lg w-3/4 mx-auto"></div>
          <div className="h-9 bg-white/30 rounded-lg w-2/3 mx-auto"></div>
          <div className="flex items-center gap-2 justify-center mt-2">
            <div className="h-1.5 w-12 bg-yellow-300/50 rounded-full" />
            <div className="h-1.5 w-8 bg-green-300/50 rounded-full" />
            <div className="h-1.5 w-5 bg-blue-300/50 rounded-full" />
          </div>
        </div>
        <div className="relative bg-white/30 rounded-3xl p-3 w-[320px] h-[320px] animate-pulse">
          <div className="rounded-2xl bg-white/20 w-full h-full"></div>
        </div>
        <div className="space-y-2 animate-pulse w-full">
          <div className="h-4 bg-white/30 rounded w-2/3 mx-auto"></div>
          <div className="h-4 bg-white/30 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="h-11 bg-white/40 rounded-full w-44 mx-auto animate-pulse"></div>
      </div>

      {/* MOBILE Skeleton (640-767px) */}
      <div className="hidden sm:flex md:hidden w-full max-w-lg flex-col items-center text-center space-y-4 mx-auto px-2">
        <div className="space-y-2 animate-pulse w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/30 rounded-full w-48 h-7 mx-auto"></div>
          <div className="h-8 bg-white/30 rounded-lg w-3/4 mx-auto"></div>
          <div className="h-8 bg-white/30 rounded-lg w-2/3 mx-auto"></div>
        </div>
        <div className="relative bg-white/30 rounded-2xl p-3 w-[260px] h-[260px] animate-pulse">
          <div className="rounded-xl bg-white/20 w-full h-full"></div>
        </div>
        <div className="space-y-2 animate-pulse w-full">
          <div className="h-3 bg-white/30 rounded w-2/3 mx-auto"></div>
          <div className="h-3 bg-white/30 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="h-10 bg-white/40 rounded-full w-full animate-pulse"></div>
      </div>

      {/* MOBILE SMALL Skeleton (<640px) */}
      <div className="flex sm:hidden w-full flex-col items-center text-center space-y-2 mx-auto px-3">
        <div className="space-y-2 animate-pulse w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/30 rounded-full w-32 h-6 mx-auto"></div>
          <div className="h-6 bg-white/30 rounded-lg w-full"></div>
          <div className="h-6 bg-white/30 rounded-lg w-4/5 mx-auto"></div>
        </div>
        <div className="relative bg-white/30 rounded-2xl p-2 w-full aspect-[16/10] animate-pulse">
          <div className="rounded-xl bg-white/20 w-full h-full"></div>
        </div>
        <div className="space-y-1 animate-pulse w-full">
          <div className="h-3 bg-white/30 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-white/30 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="h-9 bg-white/40 rounded-xl w-full animate-pulse"></div>
      </div>
    </div>
  );
});

CarouselSkeleton.displayName = 'CarouselSkeleton';

// ============================================
// SLIDE CONTENT COMPONENT
// ============================================

const SlideContent = memo<{
  slide: HeroSlide;
  imageSrc: string;
  route: string;
  index: number;
  isActive: boolean;
  onNavigate: (route: string) => void;
  badgeText: string;
  badgeTextShort: string;
  newBadge: string;
}>(({ slide, imageSrc, route, index, isActive, onNavigate, badgeText, badgeTextShort, newBadge }) => {
  const isPriority = index === 0;

  return (
    <>
      {/* DESKTOP (1280px+) */}
      <div className="hidden xl:flex w-full max-w-5xl items-center justify-between gap-8 mx-auto">
        <div className="w-[50%] space-y-4 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
              {badgeText}
            </span>
          </div>

          <div className="space-y-2">
            <h1
              className="text-4xl font-black text-white leading-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
                textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
              }}
            >
              {slide.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="h-1.5 w-16 bg-yellow-300 rounded-full" />
              <div className="h-1.5 w-10 bg-green-300 rounded-full" />
              <div className="h-1.5 w-6 bg-blue-300 rounded-full" />
            </div>
          </div>

          <p className="text-lg text-white font-bold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-xl" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
            {slide.description}
          </p>

          <button
            onClick={() => onNavigate(route)}
            className="group relative px-8 py-3.5 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110 border-2 border-white overflow-hidden"
            style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
            type="button"
            tabIndex={isActive ? 0 : -1}
          >
            <span className="relative z-10">
              {slide.button}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="w-[50%] flex justify-end items-end slide-image">
          <div className="relative z-20">
            <div className="absolute -inset-6 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-3xl opacity-30" />
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300 transform hover:rotate-2 transition-transform duration-500">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={350}
                height={350}
                className="rounded-2xl object-cover w-full h-[320px]"
                priority={isPriority}
                quality={90}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 1280px) 350px, 0px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LAPTOP (1024-1279px) */}
      <div className="hidden lg:flex xl:hidden w-full max-w-4xl items-center justify-between gap-8 mx-auto">
        <div className="w-[50%] space-y-3 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
              {badgeText}
            </span>
          </div>

          <div className="space-y-2">
            <h1
              className="text-3xl font-black text-white leading-tight drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
                textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
              }}
            >
              {slide.title}
            </h1>

            <div className="flex items-center gap-2">
              <div className="h-1.5 w-14 bg-yellow-300 rounded-full" />
              <div className="h-1.5 w-8 bg-green-300 rounded-full" />
              <div className="h-1.5 w-5 bg-blue-300 rounded-full" />
            </div>
          </div>

          <p className="text-base text-white font-bold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-md" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
            {slide.description}
          </p>

          <button
            onClick={() => onNavigate(route)}
            className="group relative px-7 py-3 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110 border-2 border-white overflow-hidden"
            style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
            type="button"
            tabIndex={isActive ? 0 : -1}
          >
            <span className="relative z-10">
              {slide.button}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="w-[50%] flex justify-end items-end slide-image">
          <div className="relative">
            <div className="absolute -inset-5 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-3xl opacity-30" />
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300 transform hover:rotate-2 transition-transform duration-500">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={300}
                height={300}
                className="rounded-2xl object-cover w-full h-[280px]"
                priority={isPriority}
                quality={85}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 1024px) and (max-width: 1279px) 300px, 0px"
              />
              <div className="absolute -top-3 -right-3 bg-green-400 text-white font-black text-sm px-3 py-1.5 rounded-full shadow-xl border-2 border-white transform rotate-12 animate-bounce">
                {newBadge}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLET (768-1023px) */}
      <div className="hidden md:flex lg:hidden w-full max-w-3xl flex-col items-center text-center space-y-4 mx-auto px-6">
        <div className="space-y-3 slide-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-yellow-300">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-black text-blue-700 tracking-wide" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
              {badgeText}
            </span>
          </div>

          <h1
            className="text-3xl font-black text-white leading-tight drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
              textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)'
            }}
          >
            {slide.title}
          </h1>

          <div className="flex items-center gap-2 justify-center">
            <div className="h-1.5 w-12 bg-yellow-300 rounded-full" />
            <div className="h-1.5 w-8 bg-green-300 rounded-full" />
            <div className="h-1.5 w-5 bg-blue-300 rounded-full" />
          </div>
        </div>

        <div className="slide-image">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-2xl opacity-30" />
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl border-4 border-yellow-300">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={320}
                height={320}
                className="rounded-2xl object-cover h-[300px] w-[320px]"
                priority={isPriority}
                quality={80}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 768px) and (max-width: 1023px) 320px, 0px"
              />
            </div>
          </div>
        </div>

        <p className="text-base text-white font-bold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] max-w-xl" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
          {slide.description}
        </p>

        <button
          onClick={() => onNavigate(route)}
          className="group relative px-7 py-3 bg-yellow-300 text-blue-700 font-black text-base rounded-full shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 border-2 border-white overflow-hidden"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          <span className="relative z-10">
            {slide.button}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* MOBILE (640-767px) */}
      <div className="hidden sm:flex md:hidden w-full max-w-lg flex-col items-center text-center space-y-4 mx-auto px-2">
        <div className="space-y-2 slide-content">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-xl border-2 border-yellow-300">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-xs font-black text-blue-700 tracking-wide" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
              {badgeText}
            </span>
          </div>

          <h1
            className="text-2xl font-black text-white leading-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
              textShadow: '2px 2px 0px rgba(0,0,0,0.3), 4px 4px 0px rgba(0,0,0,0.1)'
            }}
          >
            {slide.title}
          </h1>
        </div>

        <div className="slide-image">
          <div className="relative inline-block">
            <div className="absolute -inset-3 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-full blur-xl opacity-30" />
            <div className="relative bg-white rounded-2xl p-3 shadow-2xl border-2 border-yellow-300">
              <NextImage
                src={imageSrc}
                alt={slide.title}
                width={260}
                height={260}
                className="rounded-xl object-cover h-[240px] w-[260px]"
                priority={isPriority}
                quality={75}
                loading={isPriority ? "eager" : "lazy"}
                sizes="(min-width: 640px) and (max-width: 767px) 260px, 0px"
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-white font-bold leading-relaxed drop-shadow-[0_3px_10px_rgba(0,0,0,0.4)]" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
          {slide.description}
        </p>

        <button
          onClick={() => onNavigate(route)}
          className="group relative w-full px-6 py-3 bg-yellow-300 text-blue-700 font-black text-sm rounded-full shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 border-2 border-white overflow-hidden"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          <span className="relative z-10">
            {slide.button}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* MOBILE SMALL (<640px) */}
      <div className="flex sm:hidden w-full flex-col items-center text-center space-y-2 mx-auto px-3">
        <div className="space-y-1.5 slide-content">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border-2 border-yellow-300">
            <BookOpen className="w-3 h-3 text-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-blue-700 tracking-wide" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
              {badgeTextShort}
            </span>
          </div>

          <h1
            className="text-lg font-black text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            style={{
              fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
              textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
            }}
          >
            {slide.title}
          </h1>
        </div>

        <div className="slide-image w-full">
          <div className="relative bg-white rounded-2xl p-2 shadow-xl border-2 border-yellow-300">
            <NextImage
              src={imageSrc}
              alt={slide.title}
              width={400}
              height={250}
              className="rounded-xl object-cover w-full aspect-[16/10]"
              priority={isPriority}
              quality={70}
              loading={isPriority ? "eager" : "lazy"}
              sizes="(max-width: 639px) 92vw, 0px"
            />
            <div className="absolute -top-2 -right-2 bg-green-400 text-white font-black text-[10px] px-2 py-1 rounded-full shadow-lg border-2 border-white transform rotate-12 animate-bounce">
              {newBadge.split(' ')[0]}
            </div>
          </div>
        </div>

        <p className="text-xs text-white font-bold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}>
          {slide.description}
        </p>

        <button
          onClick={() => onNavigate(route)}
          className="w-full px-5 py-2.5 bg-yellow-300 text-blue-700 font-black text-sm rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 justify-center"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
          type="button"
          tabIndex={isActive ? 0 : -1}
        >
          {slide.button}
        </button>
      </div>
    </>
  );
});

SlideContent.displayName = 'SlideContent';

// ============================================
// MAIN COMPONENT
// ============================================

export const HeroCarousel: React.FC = () => {
  const router = useRouter();
  const { t, tArray, loading } = useSupabaseTranslations('hero');

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplay = useMemo(() => Autoplay(AUTOPLAY_CONFIG), []);
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_CONFIG, [autoplay]);
  const [selected, setSelected] = useState(0);

  // Obtener slides usando tArray
  const slides = useMemo(() =>
    tArray<HeroSlide>('slides', ['title', 'icon', 'description', 'button']),
    [tArray]
  );

  // Textos traducibles para badges
  const badgeText = t('badge_explore') || 'EXPLORE CONTENT';
  const badgeTextShort = t('badge_explore_short') || 'EXPLORE';
  const newBadge = t('badge_new') || 'NEW';

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!carouselRef.current || !emblaApi) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          emblaApi.emit('pointerDown' as any);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    autoplay.reset();
  }, [emblaApi, autoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    autoplay.reset();
  }, [emblaApi, autoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      autoplay.reset();
    },
    [emblaApi, autoplay]
  );

  const handleNavigate = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        emblaApi.emit('pointerDown' as any);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [emblaApi]);

  // Show skeleton while loading
  if (loading || slides.length === 0) {
    return (
      <div
        className="relative overflow-hidden -mt-[60px]"
        style={{ height: '100vh' }}
        role="region"
        aria-label="Carrusel de contenido educativo"
        aria-busy="true"
      >
        <div className="h-full flex items-center justify-center">
          <CarouselSkeleton />
        </div>

        {/* Skeleton nav — desktop/tablet */}
        <button disabled className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-6 z-40 p-4 rounded-full bg-white/30 border-2 border-white/30 cursor-not-allowed opacity-50 items-center justify-center" type="button">
          <ChevronLeft className="w-7 h-7 text-white" strokeWidth={4} />
        </button>
        <button disabled className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-6 z-40 p-4 rounded-full bg-white/30 border-2 border-white/30 cursor-not-allowed opacity-50 items-center justify-center" type="button">
          <ChevronRight className="w-7 h-7 text-white" strokeWidth={4} />
        </button>
        <nav className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-white px-6 py-3">
          <div className="flex items-center justify-center gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-white/40 animate-pulse" />
            ))}
          </div>
        </nav>

        {/* Skeleton nav — móvil */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 z-40 flex items-center justify-between px-4 gap-2">
          <div className="flex-shrink-0 p-2.5 rounded-full bg-white/30 border-2 border-white/30 opacity-50">
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={4} />
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-white/40 rounded-full px-3 py-2 flex-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/40 animate-pulse flex-shrink-0" />
            ))}
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-full bg-white/30 border-2 border-white/30 opacity-50">
            <ChevronRight className="w-5 h-5 text-white" strokeWidth={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className="relative overflow-hidden -mt-[60px]"
      style={{ height: '100vh' }}
      role="region"
      aria-label="Carrusel de contenido educativo"
      aria-live="polite"
    >
      <div ref={emblaRef} className="embla h-full relative z-10">
        <div className="embla__container flex h-full">
          {slides.map((slide: HeroSlide, i: number) => (
            <div
              key={i}
              className="embla__slide flex-[0_0_100%] min-w-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <div className="w-full h-full flex items-center justify-center px-1 sm:px-3 md:px-12 lg:px-20 xl:px-32 pb-16 md:pb-0">
                <SlideContent
                  slide={slide}
                  imageSrc={SLIDE_IMAGES[i]}
                  route={SLIDE_ROUTES[i]}
                  index={i}
                  isActive={selected === i}
                  onNavigate={handleNavigate}
                  badgeText={badgeText}
                  badgeTextShort={badgeTextShort}
                  newBadge={newBadge}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de Navegación — desktop/tablet */}
      <button
        onClick={scrollPrev}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 z-40 p-3 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/70 hover:scale-110 transition-all duration-300 group items-center justify-center"
        aria-label="Slide anterior"
        type="button"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:text-blue-700" strokeWidth={3} />
      </button>

      <button
        onClick={scrollNext}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 z-40 p-3 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/70 hover:scale-110 transition-all duration-300 group items-center justify-center"
        aria-label="Slide siguiente"
        type="button"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:text-blue-700" strokeWidth={3} />
      </button>

      {/* Indicadores — desktop/tablet */}
      <nav
        className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2"
        aria-label="Navegación del carrusel"
      >
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i: number) => {
            const colors = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-orange-400', 'bg-pink-400', 'bg-purple-400', 'bg-cyan-400', 'bg-lime-400', 'bg-rose-400'];
            const borderColors = ['border-yellow-600', 'border-green-600', 'border-blue-600', 'border-orange-600', 'border-pink-600', 'border-purple-600', 'border-cyan-600', 'border-lime-600', 'border-rose-600'];
            const colorClass = colors[i % colors.length];
            const borderClass = borderColors[i % borderColors.length];
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`rounded-full transition-all duration-300 border-2 ${borderClass} ${
                  selected === i
                    ? `w-10 h-3 ${colorClass} shadow-lg scale-110`
                    : `w-3 h-3 ${colorClass} opacity-50 hover:opacity-100 hover:scale-125`
                }`}
                aria-label={`Ir al slide ${i + 1}`}
                aria-current={selected === i ? 'true' : 'false'}
                type="button"
              />
            );
          })}
        </div>
      </nav>

      {/* Barra inferior móvil: flecha izq + indicadores + flecha der */}
      <div className="md:hidden absolute bottom-3 left-0 right-0 z-40 flex items-center justify-between px-3 gap-2">
        <button
          onClick={scrollPrev}
          className="flex-shrink-0 p-2 rounded-full bg-white/30 backdrop-blur-sm active:scale-95 transition-all duration-200"
          aria-label="Slide anterior"
          type="button"
        >
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={3} />
        </button>

        <div className="flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 flex-1 overflow-x-auto">
          {slides.map((_, i: number) => {
            const colors = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-orange-400', 'bg-pink-400', 'bg-purple-400', 'bg-cyan-400', 'bg-lime-400', 'bg-rose-400'];
            const colorClass = colors[i % colors.length];
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`rounded-full transition-all duration-300 flex-shrink-0 ${
                  selected === i
                    ? `w-6 h-2.5 ${colorClass} shadow-md`
                    : `w-2.5 h-2.5 ${colorClass} opacity-40`
                }`}
                aria-label={`Ir al slide ${i + 1}`}
                aria-current={selected === i ? 'true' : 'false'}
                type="button"
              />
            );
          })}
        </div>

        <button
          onClick={scrollNext}
          className="flex-shrink-0 p-2 rounded-full bg-white/30 backdrop-blur-sm active:scale-95 transition-all duration-200"
          aria-label="Slide siguiente"
          type="button"
        >
          <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />
        </button>
      </div>

      <style jsx global>{`
        .embla {
          overflow: hidden;
          transform: translateZ(0);
          will-change: transform;
        }
        
        .embla__container {
          display: flex;
          touch-action: pan-y pinch-zoom;
          backface-visibility: hidden;
        }
        
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }

        .slide-content {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .slide-image {
          animation: fadeInScale 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
          .slide-content,
          .slide-image {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;