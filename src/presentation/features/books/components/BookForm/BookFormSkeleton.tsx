/**
 * UBICACION: src/presentation/features/books/components/BookForm/BookFormSkeleton.tsx
 * Skeleton loading para el formulario de creacion/edicion de libros
 */

'use client';

import React, { memo } from 'react';

const SkeletonPulse = memo<{ className: string }>(({ className }) => (
  <div className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse ${className}`} />
));
SkeletonPulse.displayName = 'SkeletonPulse';

// Skeleton para un campo de formulario
const FieldSkeleton = memo<{ type?: 'input' | 'textarea' | 'select' }>(({ type = 'input' }) => (
  <div className="space-y-1.5">
    <SkeletonPulse className="h-3 w-20 rounded" />
    <SkeletonPulse className={`w-full rounded-md ${type === 'textarea' ? 'h-20' : 'h-8'}`} />
  </div>
));
FieldSkeleton.displayName = 'FieldSkeleton';

// Skeleton para tabs de idiomas
const LanguageTabsSkeleton = memo(() => (
  <div className="flex border-b border-gray-100">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex-1 px-3 py-2 flex items-center justify-center gap-1.5">
        <SkeletonPulse className="h-4 w-4 rounded" />
        <SkeletonPulse className="h-3 w-6 rounded" />
      </div>
    ))}
  </div>
));
LanguageTabsSkeleton.displayName = 'LanguageTabsSkeleton';

// Skeleton para seccion de traducciones
const TranslationsSkeleton = memo(() => (
  <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
      <SkeletonPulse className="h-4 w-24 rounded" />
      <SkeletonPulse className="h-3 w-8 rounded" />
    </div>
    <LanguageTabsSkeleton />
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-3 w-32 rounded" />
        <SkeletonPulse className="h-6 w-28 rounded" />
      </div>
      <FieldSkeleton type="input" />
      <FieldSkeleton type="input" />
      <FieldSkeleton type="textarea" />
      <FieldSkeleton type="textarea" />
      <div className="space-y-2">
        <SkeletonPulse className="h-3 w-16 rounded" />
        <SkeletonPulse className="h-20 w-full rounded-lg border-2 border-dashed border-gray-200" />
      </div>
    </div>
  </section>
));
TranslationsSkeleton.displayName = 'TranslationsSkeleton';

// Skeleton para seccion de autores
const AuthorsSkeleton = memo(() => (
  <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-4 w-20 rounded" />
        <SkeletonPulse className="h-3 w-12 rounded" />
      </div>
      {/* Author item skeleton */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
        <SkeletonPulse className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <SkeletonPulse className="h-3 w-24 rounded" />
          <SkeletonPulse className="h-2 w-32 rounded" />
        </div>
        <SkeletonPulse className="h-6 w-16 rounded" />
      </div>
      {/* Search skeleton */}
      <SkeletonPulse className="h-8 w-full rounded-lg" />
      <SkeletonPulse className="h-2 w-48 rounded" />
    </div>
  </section>
));
AuthorsSkeleton.displayName = 'AuthorsSkeleton';

// Skeleton para seccion de clasificacion
const ClassificationSkeleton = memo(() => (
  <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="px-3 py-2 border-b border-gray-100">
      <SkeletonPulse className="h-4 w-24 rounded" />
    </div>
    <div className="p-3 space-y-3">
      {/* Categoria */}
      <div className="space-y-1.5">
        <SkeletonPulse className="h-3 w-16 rounded" />
        <SkeletonPulse className="h-8 w-full rounded-md" />
      </div>
      {/* Niveles */}
      <div className="space-y-1.5">
        <SkeletonPulse className="h-3 w-12 rounded" />
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} className="h-8 rounded-md" />
          ))}
        </div>
      </div>
      {/* Generos */}
      <div className="space-y-1.5">
        <SkeletonPulse className="h-3 w-14 rounded" />
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonPulse key={i} className="h-6 w-16 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  </section>
));
ClassificationSkeleton.displayName = 'ClassificationSkeleton';

// Skeleton para preview
const PreviewSkeleton = memo(() => (
  <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
    <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-rose-50/50">
      <SkeletonPulse className="h-4 w-24 rounded" />
    </div>
    <div className="flex-1 p-4">
      <div className="flex gap-4 pb-4 border-b border-gray-100">
        {/* Cover skeleton */}
        <SkeletonPulse className="w-28 h-36 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-3/4 rounded" />
          <SkeletonPulse className="h-3 w-1/2 rounded" />
          <SkeletonPulse className="h-3 w-1/3 rounded" />
          <div className="flex gap-1.5 pt-2">
            <SkeletonPulse className="h-5 w-16 rounded" />
            <SkeletonPulse className="h-5 w-20 rounded" />
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-3">
        <SkeletonPulse className="h-3 w-20 rounded" />
        <SkeletonPulse className="h-16 w-full rounded" />
      </div>
    </div>
  </div>
));
PreviewSkeleton.displayName = 'PreviewSkeleton';

// Header skeleton
const HeaderSkeleton = memo(() => (
  <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
    <div className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-9 w-9 rounded-lg" />
        <div className="space-y-1">
          <SkeletonPulse className="h-5 w-32 rounded" />
          <SkeletonPulse className="h-3 w-40 rounded" />
        </div>
      </div>
      <SkeletonPulse className="h-9 w-28 rounded-lg" />
    </div>
  </div>
));
HeaderSkeleton.displayName = 'HeaderSkeleton';

/**
 * BookFormSkeleton - Skeleton completo para el formulario de libros
 */
export const BookFormSkeleton = memo(() => {
  return (
    <div className="h-[calc(100vh-60px)] flex flex-col bg-gradient-to-br from-amber-50/30 via-white to-rose-50/30">
      <HeaderSkeleton />

      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="h-full grid grid-cols-2 gap-4">
          {/* Columna izquierda */}
          <div className="overflow-y-auto pr-2 space-y-3">
            <TranslationsSkeleton />
            <AuthorsSkeleton />
            <ClassificationSkeleton />
          </div>

          {/* Columna derecha - Preview */}
          <div className="overflow-hidden">
            <PreviewSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
});

BookFormSkeleton.displayName = 'BookFormSkeleton';

export default BookFormSkeleton;
