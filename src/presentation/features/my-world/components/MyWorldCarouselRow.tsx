// src/presentation/features/my-world/components/MyWorldCarouselRow.tsx
/**
 * ============================================
 * COMPONENTE: MyWorldCarouselRow
 * Fila horizontal tipo Netflix para Mi Mundo
 * Scroll suave con botones de navegacion
 * ============================================
 */

'use client';

import React, { memo, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MyWorldCarouselRowProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  previousLabel?: string;
  nextLabel?: string;
}

export const MyWorldCarouselRowSkeleton: React.FC = memo(() => (
  <section className="py-5 px-4">
    <div className="container mx-auto max-w-7xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-white/30 rounded-full animate-pulse" />
        <div className="h-7 bg-white/30 rounded-xl w-44 animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-shrink-0 w-40 sm:w-44 md:w-48 bg-white rounded-2xl border-2 border-yellow-200 overflow-hidden animate-pulse">
            <div className="aspect-[2/3] bg-gradient-to-br from-blue-100 to-purple-100" />
            <div className="p-2.5 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

MyWorldCarouselRowSkeleton.displayName = 'MyWorldCarouselRowSkeleton';

export const MyWorldCarouselRow: React.FC<MyWorldCarouselRowProps> = memo(
  ({ title, icon, children, isEmpty = false, emptyMessage, emptyIcon, previousLabel = 'Anterior', nextLabel = 'Siguiente' }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }, []);

    const scroll = useCallback(
      (direction: 'left' | 'right') => {
        if (scrollRef.current) {
          const scrollAmount = 220;
          scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
          });
          setTimeout(checkScrollButtons, 300);
        }
      },
      [checkScrollButtons]
    );

    if (isEmpty) {
      return (
        <section className="py-5 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center gap-3 mb-4">
              {icon && (
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  {icon}
                </div>
              )}
              <h2
                className="text-xl md:text-2xl font-black text-white drop-shadow-lg"
                style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
              >
                {title}
              </h2>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-white/30">
              {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
              <p className="text-white/80 font-bold text-sm" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {emptyMessage}
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-5 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  {icon}
                </div>
              )}
              <h2
                className="text-xl md:text-2xl font-black text-white drop-shadow-lg"
                style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
              >
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full bg-white shadow-lg border-2 border-yellow-300 transition-all ${
                  canScrollLeft ? 'hover:scale-110 hover:bg-yellow-50' : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={previousLabel}
              >
                <ChevronLeft className="w-4 h-4 text-blue-700" strokeWidth={3} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-full bg-white shadow-lg border-2 border-yellow-300 transition-all ${
                  canScrollRight ? 'hover:scale-110 hover:bg-yellow-50' : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={nextLabel}
              >
                <ChevronRight className="w-4 h-4 text-blue-700" strokeWidth={3} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {children}
          </div>

          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </section>
    );
  }
);

MyWorldCarouselRow.displayName = 'MyWorldCarouselRow';
