/**
 * UBICACION: src/presentation/features/books/components/BookForm/BookFormSkeleton.tsx
 * Skeleton loading para el formulario de creacion/edicion de libros
 * Diseño suave y limpio — consistente con el form rediseñado
 */

'use client';

import React, { memo } from 'react';

const Pulse = memo<{ className: string }>(({ className }) => (
  <div className={`bg-slate-200/40 animate-pulse rounded-lg ${className}`} />
));
Pulse.displayName = 'Pulse';

const FieldSkeleton = memo<{ type?: 'input' | 'textarea' }>(({ type = 'input' }) => (
  <div className="space-y-1.5">
    <Pulse className="h-3 w-20" />
    <Pulse className={`w-full rounded-xl ${type === 'textarea' ? 'h-18' : 'h-10'}`} />
  </div>
));
FieldSkeleton.displayName = 'FieldSkeleton';

const LanguageTabsSkeleton = memo(() => (
  <div className="flex border-b border-slate-100">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex-1 px-3 py-2.5 flex items-center justify-center gap-1.5">
        <Pulse className="h-4 w-4 !rounded-full" />
        <Pulse className="h-3 w-7" />
      </div>
    ))}
  </div>
));
LanguageTabsSkeleton.displayName = 'LanguageTabsSkeleton';

const TranslationsSkeleton = memo(() => (
  <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Pulse className="h-6 w-6 !rounded-lg" />
        <Pulse className="h-4 w-28" />
      </div>
      <Pulse className="h-4 w-8 !rounded-full" />
    </div>
    <LanguageTabsSkeleton />
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <Pulse className="h-3 w-32" />
        <Pulse className="h-6 w-20 !rounded-lg" />
      </div>
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton type="textarea" />
      <FieldSkeleton type="textarea" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Pulse className="h-3 w-16" />
          <Pulse className="h-32 w-24 !rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Pulse className="h-3 w-12" />
          <Pulse className="h-20 w-full !rounded-xl border-2 border-dashed border-slate-100" />
        </div>
      </div>
    </div>
  </section>
));
TranslationsSkeleton.displayName = 'TranslationsSkeleton';

const AuthorsSkeleton = memo(() => (
  <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
      <Pulse className="h-6 w-6 !rounded-lg" />
      <Pulse className="h-4 w-20" />
    </div>
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100">
        <Pulse className="h-9 w-9 !rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-2.5 w-32" />
        </div>
        <Pulse className="h-6 w-16 !rounded-lg" />
      </div>
      <Pulse className="h-9 w-full !rounded-xl" />
    </div>
  </section>
));
AuthorsSkeleton.displayName = 'AuthorsSkeleton';

const ClassificationSkeleton = memo(() => (
  <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
      <Pulse className="h-6 w-6 !rounded-lg" />
      <Pulse className="h-4 w-24" />
    </div>
    <div className="p-5 space-y-5">
      <div className="space-y-1.5">
        <Pulse className="h-3 w-16" />
        <Pulse className="h-9 w-full !rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Pulse className="h-3 w-12" />
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map(i => <Pulse key={i} className="h-8 !rounded-xl" />)}
        </div>
      </div>
      <div className="space-y-1.5">
        <Pulse className="h-3 w-14" />
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map(i => <Pulse key={i} className="h-6 w-16 !rounded-md" />)}
        </div>
      </div>
    </div>
  </section>
));
ClassificationSkeleton.displayName = 'ClassificationSkeleton';

const PreviewSkeleton = memo(() => (
  <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
      <Pulse className="h-6 w-6 !rounded-lg" />
      <Pulse className="h-4 w-20" />
    </div>
    <div className="p-5">
      <div className="flex gap-3.5 pb-4 border-b border-slate-100">
        <Pulse className="w-28 h-38 !rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <Pulse className="h-5 w-3/4" />
          <Pulse className="h-3.5 w-1/2" />
          <Pulse className="h-3 w-1/3" />
          <div className="flex gap-1.5 pt-1">
            <Pulse className="h-5 w-16 !rounded-md" />
            <Pulse className="h-5 w-20 !rounded-md" />
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-3">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-14 w-full" />
      </div>
    </div>
  </section>
));
PreviewSkeleton.displayName = 'PreviewSkeleton';

const HeaderSkeleton = memo(() => (
  <div className="px-4 pt-5 pb-3">
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Pulse className="h-9 w-9 !rounded-xl !bg-white/50" />
          <div className="space-y-1.5">
            <Pulse className="h-6 w-44 !bg-white/40" />
            <Pulse className="h-3 w-28 !bg-white/30" />
          </div>
        </div>
        <Pulse className="h-10 w-28 !rounded-xl !bg-white/50" />
      </div>
    </div>
  </div>
));
HeaderSkeleton.displayName = 'HeaderSkeleton';

export const BookFormSkeleton = memo(() => (
  <div>
    <HeaderSkeleton />
    <div className="px-4 pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-5">
            <TranslationsSkeleton />
            <AuthorsSkeleton />
            <ClassificationSkeleton />
          </div>
          <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
            <PreviewSkeleton />
          </div>
        </div>
      </div>
    </div>
  </div>
));
BookFormSkeleton.displayName = 'BookFormSkeleton';

export default BookFormSkeleton;
