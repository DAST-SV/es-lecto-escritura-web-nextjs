/**
 * HomePage
 * @file app/[locale]/page.tsx
 * @description Landing page con snap scroll tipo TikTok
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import {
  HeroCarousel,
  FeaturesSection,
  CTASection,
  HomeBackground,
} from '@/src/presentation/features/home';

// ============================================
// NAVBAR HEIGHT
// ============================================
const NAVBAR_H = 60;

// ============================================
// SNAP SCROLL HOOK — tipo TikTok
// ============================================

function useTikTokSnap() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isSnapping = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  const setRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      sectionRefs.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    /**
     * Snap TikTok: cuando el usuario deja de scrollear (80ms),
     * snap inmediato a la sección que tenga más visibilidad.
     * Siempre snapea — sin zona muerta.
     */
    const snapToNearest = () => {
      if (isSnapping.current) return;

      const sections = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
      if (sections.length === 0) return;

      const vh = window.innerHeight;
      let bestSection: HTMLDivElement | null = null;
      let bestVisibleRatio = -1;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, NAVBAR_H);
        const visibleBottom = Math.min(rect.bottom, vh);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const sectionHeight = rect.height;
        if (sectionHeight === 0) continue;
        const ratio = visibleHeight / Math.min(sectionHeight, vh - NAVBAR_H);
        if (ratio > bestVisibleRatio) {
          bestVisibleRatio = ratio;
          bestSection = section;
        }
      }

      if (!bestSection) return;

      const rect = bestSection.getBoundingClientRect();
      const isHero = sections.indexOf(bestSection) === 0;
      const targetTop = isHero ? 0 : NAVBAR_H;
      const diff = Math.abs(rect.top - targetTop);

      // Ya alineado — no hacer nada
      if (diff < 3) return;

      isSnapping.current = true;
      const scrollTarget = window.scrollY + rect.top - targetTop;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      setTimeout(() => { isSnapping.current = false; }, 500);
    };

    const handleScroll = () => {
      lastScrollY.current = window.scrollY;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(snapToNearest, 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return { setRef };
}

// ============================================
// COMPONENT
// ============================================

const HomePage: React.FC = () => {
  const { setRef } = useTikTokSnap();

  return (
    <UnifiedLayout
      className="bg-blue-400"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      {/* Hero Carousel — 100vh completo */}
      <div ref={setRef(0)} className="w-full">
        <HeroCarousel />
      </div>

      {/* Features Section — con scroll-margin para no quedar bajo navbar */}
      <div ref={setRef(1)} className="w-full" style={{ scrollMarginTop: NAVBAR_H }}>
        <FeaturesSection />
      </div>

      {/* CTA Section */}
      <div ref={setRef(2)} className="w-full" style={{ scrollMarginTop: NAVBAR_H }}>
        <CTASection />
      </div>
    </UnifiedLayout>
  );
};

export default HomePage;
