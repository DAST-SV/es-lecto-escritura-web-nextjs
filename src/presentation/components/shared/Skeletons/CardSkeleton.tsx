// ============================================
// src/presentation/components/shared/Skeletons/CardSkeleton.tsx
// Skeleton para tarjetas de contenido
// ============================================

'use client';

import React, { memo } from 'react';

interface CardSkeletonProps {
  /** Mostrar imagen */
  showImage?: boolean;
  /** Alto de la imagen */
  imageHeight?: string;
  /** Numero de lineas de texto */
  lines?: number;
  /** Mostrar badge */
  showBadge?: boolean;
  /** Mostrar footer con acciones */
  showFooter?: boolean;
}

/**
 * Skeleton para tarjetas de contenido (libros, categorias, etc.)
 */
export const CardSkeleton = memo<CardSkeletonProps>(({
  showImage = true,
  imageHeight = 'h-40',
  lines = 3,
  showBadge = true,
  showFooter = true,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
      {/* Image */}
      {showImage && (
        <div className={`${imageHeight} bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse relative`}>
          {showBadge && (
            <div className="absolute top-3 left-3">
              <div className="h-6 w-16 bg-white/80 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse w-3/4" />

        {/* Description lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded animate-pulse"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full animate-pulse" />
              <div className="h-3 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

interface CardGridSkeletonProps {
  /** Numero de tarjetas */
  count?: number;
  /** Columnas en diferentes breakpoints */
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Props para cada tarjeta */
  cardProps?: CardSkeletonProps;
}

/**
 * Grid de tarjetas skeleton
 */
export const CardGridSkeleton = memo<CardGridSkeletonProps>(({
  count = 6,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  cardProps = {},
}) => {
  const gridCols = `grid-cols-1 sm:grid-cols-${cols.sm || 1} md:grid-cols-${cols.md || 2} lg:grid-cols-${cols.lg || 3} xl:grid-cols-${cols.xl || 4}`;

  return (
    <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} {...cardProps} />
      ))}
    </div>
  );
});

CardGridSkeleton.displayName = 'CardGridSkeleton';
