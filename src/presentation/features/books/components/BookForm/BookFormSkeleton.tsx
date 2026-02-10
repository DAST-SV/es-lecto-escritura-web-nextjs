/**
 * UBICACION: src/presentation/features/books/components/BookForm/BookFormSkeleton.tsx
 * Skeleton loading para el formulario de creacion/edicion de libros
 * Layout consistente con BookFormViewMultilang
 */

'use client';

import React, { memo } from 'react';

const Pulse = memo<{ className: string }>(({ className }) => (
  <div className={`bg-slate-200/40 animate-pulse rounded-lg ${className}`} />
));
Pulse.displayName = 'Pulse';

/** Header: [← ] [tab tab] [Guardar] */
const HeaderSkeleton = memo(() => (
  <div className="px-3 pt-3 pb-2 flex items-center gap-2">
    {/* Volver */}
    <Pulse className="h-7 w-7 !rounded-lg flex-shrink-0 !bg-white/50" />
    {/* Tabs */}
    <div className="flex-1 flex bg-white/20 rounded-xl p-0.5 gap-0.5">
      <Pulse className="flex-1 h-7 !rounded-lg !bg-white/40" />
      <Pulse className="flex-1 h-7 !rounded-lg !bg-white/25" />
    </div>
    {/* Guardar */}
    <Pulse className="h-7 w-20 !rounded-lg flex-shrink-0 !bg-white/50" />
  </div>
));
HeaderSkeleton.displayName = 'HeaderSkeleton';

/** Pestañas de idioma */
const LangTabsSkeleton = memo(() => (
  <div className="flex border-b border-slate-100 bg-gray-50/50">
    {[1, 2].map(i => (
      <div key={i} className="flex-1 flex items-center justify-center gap-1.5 py-2">
        <Pulse className="h-3.5 w-3.5 !rounded-full" />
        <Pulse className="h-3 w-10" />
      </div>
    ))}
  </div>
));
LangTabsSkeleton.displayName = 'LangTabsSkeleton';

/** Panel principal: lang-tabs + campos */
const MainPanelSkeleton = memo(() => (
  <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-yellow-200/30 overflow-hidden">
    <LangTabsSkeleton />
    <div className="p-3 space-y-3">
      {/* Primary toggle */}
      <Pulse className="h-6 w-full !rounded-lg" />
      {/* Row: título+subtítulo | personajes */}
      <div className="grid grid-cols-2 gap-3">
        {/* Título + subtítulo con fondo */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-2.5 space-y-2.5">
          <div className="space-y-1.5">
            <Pulse className="h-2.5 w-12" />
            <Pulse className="h-7 w-full !rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Pulse className="h-2.5 w-16" />
            <Pulse className="h-7 w-full !rounded-lg" />
          </div>
        </div>
        {/* Personajes */}
        <div className="space-y-2">
          <Pulse className="h-2.5 w-16" />
          <Pulse className="h-7 w-full !rounded-lg" />
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3].map(i => <Pulse key={i} className="h-5 w-16 !rounded-full" />)}
          </div>
        </div>
      </div>
      {/* Row: descripción | resumen */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-2.5 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Pulse className="h-2.5 w-16" />
          <Pulse className="h-16 w-full !rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Pulse className="h-2.5 w-20" />
          <Pulse className="h-16 w-full !rounded-lg" />
        </div>
      </div>
    </div>
  </div>
));
MainPanelSkeleton.displayName = 'MainPanelSkeleton';

/** Columna lateral: portada + PDF */
const SidebarSkeleton = memo(() => (
  <div className="w-40 flex-shrink-0 space-y-2">
    {/* Portada */}
    <div className="bg-white rounded-2xl border border-yellow-200/30 overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1">
        <Pulse className="h-3 w-3" />
        <Pulse className="h-3 w-12" />
      </div>
      <div className="p-2 flex justify-center">
        <Pulse className="w-[120px] h-[168px] !rounded-lg" />
      </div>
    </div>
    {/* PDF */}
    <div className="bg-white rounded-2xl border border-yellow-200/30 overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1">
        <Pulse className="h-3 w-3" />
        <Pulse className="h-3 w-8" />
      </div>
      <div className="p-2">
        <Pulse className="h-16 w-full !rounded-lg border-2 border-dashed border-slate-100" />
      </div>
    </div>
  </div>
));
SidebarSkeleton.displayName = 'SidebarSkeleton';

/** Row 2: Autores + Clasificación */
const Row2Skeleton = memo(() => (
  <div className="flex gap-2 items-start">
    {/* Autores */}
    <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-yellow-200/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
        <Pulse className="h-3 w-3" />
        <Pulse className="h-3 w-14" />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/50 border border-slate-100">
          <Pulse className="h-8 w-8 !rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-2.5 w-20" />
            <Pulse className="h-2 w-28" />
          </div>
        </div>
        <Pulse className="h-7 w-full !rounded-xl" />
      </div>
    </div>
    {/* Clasificación */}
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-yellow-200/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
        <Pulse className="h-3 w-3" />
        <Pulse className="h-3 w-20" />
      </div>
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/40 px-2 gap-1 py-1">
        {[1, 2, 3, 4, 5].map(i => <Pulse key={i} className="h-6 w-16 !rounded-md flex-shrink-0" />)}
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5, 6].map(i => <Pulse key={i} className="h-7 w-20 !rounded-full" />)}
        </div>
      </div>
    </div>
  </div>
));
Row2Skeleton.displayName = 'Row2Skeleton';

export const BookFormSkeleton = memo(() => (
  <div className="pb-6">
    <HeaderSkeleton />
    <div className="px-3 space-y-2">
      {/* Row 1: panel principal + sidebar */}
      <div className="flex gap-2 items-start">
        <MainPanelSkeleton />
        <SidebarSkeleton />
      </div>
      {/* Row 2: autores + clasificación */}
      <Row2Skeleton />
    </div>
  </div>
));
BookFormSkeleton.displayName = 'BookFormSkeleton';

export default BookFormSkeleton;
