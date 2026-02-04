// ============================================
// src/presentation/features/book-categories/components/BookCategoryTableSkeleton.tsx
// Skeleton: Loading state para tabla de categorías
// ============================================

'use client';

import React, { memo } from 'react';

interface BookCategoryTableSkeletonProps {
  rows?: number;
}

export const BookCategoryTableSkeleton: React.FC<BookCategoryTableSkeletonProps> = memo(({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="h-7 bg-amber-200 rounded w-48" />
          <div className="flex gap-3">
            <div className="h-10 bg-amber-200 rounded-lg w-64" />
            <div className="h-10 bg-amber-300 rounded-lg w-32" />
          </div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-20" />
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              {/* Icono + Color */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                <div className="w-6 h-6 bg-slate-200 rounded-full" />
              </div>
              {/* Nombre */}
              <div className="h-5 bg-slate-200 rounded w-32" />
              {/* Slug */}
              <div className="h-4 bg-slate-100 rounded w-24" />
              {/* Orden */}
              <div className="h-6 bg-slate-200 rounded-full w-8 mx-auto" />
              {/* Estado */}
              <div className="h-6 bg-slate-200 rounded-full w-16" />
              {/* Acciones */}
              <div className="flex gap-2 justify-end">
                <div className="w-8 h-8 bg-slate-200 rounded" />
                <div className="w-8 h-8 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

BookCategoryTableSkeleton.displayName = 'BookCategoryTableSkeleton';

export default BookCategoryTableSkeleton;
