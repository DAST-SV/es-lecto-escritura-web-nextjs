/**
 * ============================================
 * COMPONENTE: BookCardSkeleton
 * Skeleton loading para BookCard
 * ============================================
 */

'use client';

import React, { memo } from 'react';

export const BookCardSkeleton: React.FC = memo(() => {
  return (
    <div className="bg-white rounded-3xl border-4 border-yellow-200 shadow-lg overflow-hidden animate-pulse">
      {/* Portada skeleton */}
      <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300" />

      {/* Contenido skeleton */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded-lg w-full" />
          <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
        </div>

        {/* Rating */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-3.5 h-3.5 bg-slate-200 rounded-full" />
          ))}
          <div className="w-8 h-3.5 bg-slate-200 rounded-full ml-1" />
        </div>

        {/* Nivel */}
        <div className="h-5 bg-slate-200 rounded-full w-24" />

        {/* Categorías */}
        <div className="flex gap-1">
          <div className="h-5 bg-slate-200 rounded-full w-16" />
          <div className="h-5 bg-slate-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
});

BookCardSkeleton.displayName = 'BookCardSkeleton';

export default BookCardSkeleton;
