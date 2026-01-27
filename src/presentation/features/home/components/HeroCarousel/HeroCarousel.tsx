/**
 * HeroCarousel Component
 * @file src/presentation/features/home/components/HeroCarousel/HeroCarousel.tsx
 * @description Main hero carousel for the home page
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
  const { t, loading } = useSupabaseTranslations('hero');
  const router = useRouter();

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

  // Get slides from translations
  const slides: HeroSlide[] = !loading ? (t('slides') as unknown as HeroSlide[]) || [] : [];

  // ============================================
  // CALLBACKS
  // ============================================

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (targetIndex: number) => {
      if (!emblaApi) return;

      const currentIndex = emblaApi.selectedScrollSnap();
      const slideCount = slides.length;

      if (currentIndex === targetIndex) return;

      const forwardDistance =
        targetIndex > currentIndex
          ? targetIndex - currentIndex
          : slideCount - currentIndex + targetIndex;

      const backwardDistance =
        currentIndex > targetIndex
          ? currentIndex - targetIndex
          : currentIndex + slideCount - targetIndex;

      if (forwardDistance <= backwardDistance) {
        if (forwardDistance <= 3) {
          emblaApi.scrollTo(targetIndex);
        } else {
          for (let i = 0; i < forwardDistance; i++) {
            setTimeout(() => emblaApi.scrollNext(), i * 25);
          }
        }
      } else {
        if (backwardDistance <= 3) {
          emblaApi.scrollTo(targetIndex);
        } else {
          for (let i = 0; i < backwardDistance; i++) {
            setTimeout(() => emblaApi.scrollPrev(), i * 25);
          }
        }
      }
    },
    [emblaApi, slides.length]
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

  // Setup Embla listeners
  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    const startAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        if (emblaApi && isPlaying && isVisible) {
          emblaApi.scrollNext();
        }
      }, AUTO_PLAY_INTERVAL);
    };

    if (emblaApi && isPlaying && isVisible) {
      startAutoPlay();
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [emblaApi, isPlaying, isVisible]);

  // Visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, {
      passive: true,
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup
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
      <div className="relative h-[calc(100vh-56px)] overflow-hidden bg-gradient-to-r from-blue-100 to-green-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
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
      {/* Background */}
      <div
        ref={emblaRef}
        className="embla h-full bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url(${imagesConfig.dashboard.backgroundV1})`,
          transform: 'translate3d(0,0,0)',
        }}
      >
        <div className="embla__container flex h-full">
          {slides.map((slide: HeroSlide, i: number) => (
            <div
              key={i}
              className="embla__slide w-full flex-shrink-0 h-full will-change-transform"
            >
              <div className="w-full flex items-center px-6 md:px-16 py-10">
                {/* Desktop Layout */}
                <div className="hidden md:flex w-full h-full items-center max-w-7xl mx-auto">
                  {/* Text Content */}
                  <div className="w-1/2 pr-12 text-slate-800 flex flex-col justify-center ml-8 lg:ml-16">
                    <div className="flex items-center mb-6">
                      <span className="text-6xl mr-6 drop-shadow-lg select-none">
                        {slide.icon}
                      </span>
                      <h2 className="text-4xl lg:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm select-none">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-xl leading-relaxed font-medium mb-8 text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800 select-none">
                      &quot;{slide.description}&quot;
                    </p>
                    <button
                      onClick={() => router.push(heroSlideRoutes[i])}
                      className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 transform hover:scale-105 active:scale-95 w-fit text-lg border-2 border-slate-600 hover:border-slate-500 will-change-transform"
                    >
                      {slide.button}
                    </button>
                  </div>

                  {/* Image */}
                  <div className="w-1/2 flex justify-center items-center pr-8 lg:pr-16">
                    <NextImage
                      src={heroSlideImages[i]}
                      alt={slide.title}
                      width={500}
                      height={500}
                      className="rounded-2xl object-fill max-h-[70vh] shadow-2xl will-change-transform"
                      priority={i <= 2}
                    />
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden w-full h-full flex flex-col justify-center items-center text-slate-800 text-center px-4">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-5xl mr-4 drop-shadow-lg select-none">
                      {slide.icon}
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm select-none">
                      {slide.title}
                    </h2>
                  </div>
                  <div className="mb-6">
                    <NextImage
                      src={heroSlideImages[i]}
                      alt={slide.title}
                      width={320}
                      height={320}
                      className="rounded-xl object-fill shadow-2xl will-change-transform"
                      priority={i <= 2}
                    />
                  </div>
                  <p className="text-base leading-relaxed font-medium mb-6 max-w-md text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg select-none">
                    &quot;{slide.description}&quot;
                  </p>
                  <button
                    onClick={() => router.push(heroSlideRoutes[i])}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-slate-600 transition-all duration-200 transform active:scale-95 will-change-transform"
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
        className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110 active:scale-95 will-change-transform"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-all duration-200 z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600 hover:scale-110 active:scale-95 will-change-transform"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i: number) => (
          <button
            key={i}
            onClick={() => {
              scrollTo(i);
              handlePause();
            }}
            className={`w-4 h-4 rounded-full transition-all duration-200 border-2 will-change-transform ${
              selected === i
                ? 'bg-slate-800 border-slate-600 scale-125 shadow-lg'
                : 'bg-white/70 border-slate-800/50 hover:bg-white hover:border-slate-600 hover:scale-110 active:scale-95'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .embla {
          overflow: hidden;
          transform: translate3d(0, 0, 0);
        }
        .embla__container {
          display: flex;
          backface-visibility: hidden;
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
          transform: translate3d(0, 0, 0);
        }
        .embla__slide > div {
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
          will-change: opacity, transform;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
