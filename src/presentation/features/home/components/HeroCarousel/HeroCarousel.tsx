/**
 * HeroCarousel Component
 * @file src/presentation/features/home/components/HeroCarousel/HeroCarousel.tsx
 * @description Main hero carousel for the home page with dynamic Supabase translations
 */

'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { NextImage } from '@/src/presentation/components/ui/NextImage';
import {
  imagesConfig,
  heroSlideImages,
  heroSlideRoutes,
} from '@/src/infrastructure/config/images.config';

import type { HeroSlide } from '../../types';

// ============================================
// CONSTANTS
// ============================================

const AUTO_PLAY_INTERVAL = 6000;
const PAUSE_TIMEOUT = 3000;

// ============================================
// COMPONENT
// ============================================

export const HeroCarousel: React.FC = () => {
  const { tArray, loading } = useSupabaseTranslations('hero');
  const router = useRouter();

  // Get slides dynamically from Supabase translations
  const slides = tArray('slides', ['title', 'icon', 'description', 'button']) as unknown as HeroSlide[];

  // Embla carousel configuration
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
    duration: 25,
    startIndex: 0,
    containScroll: 'trimSnaps',
    inViewThreshold: 0.7,
  });

  const [selected, setSelected] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Refs for timers
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // CALLBACKS
  // ============================================

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (targetIndex: number) => {
      emblaApi?.scrollTo(targetIndex);
    },
    [emblaApi]
  );

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPlaying(true);
    }, PAUSE_TIMEOUT);
  }, []);

  const handleResume = useCallback(() => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setIsPlaying(true);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !isPlaying || !isVisible || slides.length === 0) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [emblaApi, isPlaying, isVisible, slides.length]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading || slides.length === 0) {
    return (
      <div className="relative h-[calc(100vh-56px)] overflow-hidden will-change-transform">
        <div
          className="h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url(${imagesConfig.dashboard.backgroundV1})`,
            transform: 'translate3d(0,0,0)',
          }}
        >
          <div className="w-full h-full flex items-center px-6 md:px-16 py-10">
            {/* Desktop Skeleton Layout */}
            <div className="hidden md:flex w-full h-full items-center max-w-7xl mx-auto">
              {/* Left Content - Exact structure */}
              <div className="w-1/2 pr-12 text-slate-800 flex flex-col justify-center ml-8 lg:ml-16">
                {/* Icon + Title Skeleton */}
                <div className="flex items-center mb-6">
                  <div className="w-[60px] h-[60px] bg-slate-700/20 rounded-xl mr-6 animate-pulse shadow-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-12 bg-slate-800/20 rounded-lg w-[85%] animate-pulse" />
                    <div className="h-12 bg-slate-800/20 rounded-lg w-[60%] animate-pulse" />
                  </div>
                </div>
                
                {/* Description Skeleton - matches the quote box */}
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800 mb-8">
                  <div className="space-y-3">
                    <div className="h-6 bg-slate-700/30 rounded w-full animate-pulse" />
                    <div className="h-6 bg-slate-700/30 rounded w-[95%] animate-pulse" />
                    <div className="h-6 bg-slate-700/30 rounded w-[75%] animate-pulse" />
                  </div>
                </div>
                
                {/* Button Skeleton - exact dimensions */}
                <div className="h-[56px] bg-slate-800/40 rounded-xl w-[200px] animate-pulse shadow-2xl border-2 border-slate-600/30" />
              </div>
              
              {/* Right Image Skeleton - exact dimensions */}
              <div className="w-1/2 flex justify-center items-center pr-8 lg:pr-16">
                <div className="w-[500px] h-[500px] bg-slate-700/20 rounded-2xl shadow-2xl animate-pulse max-h-[70vh]" />
              </div>
            </div>

            {/* Mobile Skeleton Layout */}
            <div className="md:hidden w-full h-full flex flex-col justify-center items-center text-slate-800 text-center px-4">
              {/* Icon + Title Skeleton */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-[50px] h-[50px] bg-slate-700/20 rounded-lg mr-4 animate-pulse shadow-lg" />
                <div className="h-10 bg-slate-800/20 rounded-lg w-[180px] animate-pulse" />
              </div>
              
              {/* Image Skeleton - mobile dimensions */}
              <div className="mb-6">
                <div className="w-[320px] h-[320px] bg-slate-700/20 rounded-xl shadow-2xl animate-pulse" />
              </div>
              
              {/* Description Skeleton */}
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg mb-6 max-w-md w-full">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700/30 rounded w-full animate-pulse" />
                  <div className="h-4 bg-slate-700/30 rounded w-[90%] mx-auto animate-pulse" />
                  <div className="h-4 bg-slate-700/30 rounded w-[70%] mx-auto animate-pulse" />
                </div>
              </div>
              
              {/* Button Skeleton - mobile */}
              <div className="h-[48px] bg-slate-800/40 rounded-lg w-[160px] animate-pulse shadow-2xl border-2 border-slate-600/30" />
            </div>
          </div>
        </div>

        {/* Disabled Navigation Buttons - exact styling */}
        <button
          disabled
          className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-slate-800/30 p-3 rounded-full backdrop-blur-sm shadow-xl border-2 border-slate-600/30 cursor-not-allowed opacity-50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white/50" />
        </button>

        <button
          disabled
          className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-slate-800/30 p-3 rounded-full backdrop-blur-sm shadow-xl border-2 border-slate-600/30 cursor-not-allowed opacity-50"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white/50" />
        </button>

        {/* Skeleton Dots Indicator - exact styling */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 animate-pulse ${
                i === 0
                  ? 'bg-slate-800/40 border-slate-600/40 scale-125'
                  : 'bg-white/40 border-slate-800/30'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className="relative h-[calc(100vh-56px)] overflow-hidden will-change-transform"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
    >
      <div
        ref={emblaRef}
        className="embla h-full bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url(${imagesConfig.dashboard.backgroundV1})`,
          transform: 'translate3d(0,0,0)',
        }}
      >
        <div className="embla__container flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="embla__slide w-full flex-shrink-0 h-full will-change-transform">
              <div className="w-full flex items-center px-6 md:px-16 py-10">
                {/* Desktop Layout */}
                <div className="hidden md:flex w-full h-full items-center max-w-7xl mx-auto">
                  <div className="w-1/2 pr-12 text-slate-800 flex flex-col justify-center ml-8 lg:ml-16">
                    <div className="flex items-center mb-6">
                      <span className="text-6xl mr-6 drop-shadow-lg select-none">{slide.icon}</span>
                      <h2 className="text-4xl lg:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm select-none">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-xl leading-relaxed font-medium mb-8 text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800 select-none">
                      &quot;{slide.description}&quot;
                    </p>
                    <button
                      onClick={() => router.push(heroSlideRoutes[i] || '/explore')}
                      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 transform hover:scale-105 active:scale-95 w-fit text-lg border-2 border-slate-600"
                    >
                      {slide.button}
                    </button>
                  </div>
                  <div className="w-1/2 flex justify-center items-center pr-8 lg:pr-16">
                    <NextImage
                      src={heroSlideImages[i] || imagesConfig.placeholders.default}
                      alt={slide.title}
                      width={500}
                      height={500}
                      className="rounded-2xl object-fill max-h-[70vh] shadow-2xl"
                      priority={i <= 2}
                    />
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden w-full h-full flex flex-col justify-center items-center text-slate-800 text-center px-4">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-5xl mr-4 drop-shadow-lg select-none">{slide.icon}</span>
                    <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm select-none">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="mb-6">
                    <NextImage
                      src={heroSlideImages[i] || imagesConfig.placeholders.default}
                      alt={slide.title}
                      width={320}
                      height={320}
                      className="rounded-xl object-fill shadow-2xl"
                      priority={i <= 2}
                    />
                  </div>
                  <p className="text-base leading-relaxed font-medium mb-6 max-w-md text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg select-none">
                    &quot;{slide.description}&quot;
                  </p>
                  <button
                    onClick={() => router.push(heroSlideRoutes[i] || '/explore')}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-slate-600 transition-all duration-200 transform active:scale-95"
                  >
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              scrollTo(i);
              handlePause();
            }}
            className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
              selected === i
                ? 'bg-slate-800 border-slate-600 scale-125 shadow-lg'
                : 'bg-white/70 border-slate-800/50 hover:bg-white hover:border-slate-600 hover:scale-110 active:scale-95'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .embla { overflow: hidden; transform: translate3d(0, 0, 0); }
        .embla__container { display: flex; backface-visibility: hidden; will-change: transform; }
        .embla__slide { flex: 0 0 100%; min-width: 0; transform: translate3d(0, 0, 0); }
      `}</style>
    </div>
  );
};

export default HeroCarousel;