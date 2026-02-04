// ============================================
// src/presentation/components/shared/Skeletons/AdminPageSkeleton.tsx
// Skeleton completo para paginas de admin con layout
// ============================================

'use client';

import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface AdminPageSkeletonProps {
  /** Titulo de la pagina (para el loader) */
  title?: string;
  /** Color primario del gradiente */
  gradientFrom?: string;
  /** Color secundario del gradiente */
  gradientVia?: string;
  /** Color final del gradiente */
  gradientTo?: string;
  /** Color del icono de carga */
  loaderColor?: string;
}

/**
 * Skeleton de pagina completa para admin
 * Incluye el fondo degradado y el indicador de carga
 */
export const AdminPageSkeleton = memo<AdminPageSkeletonProps>(({
  title = 'Cargando...',
  gradientFrom = 'from-indigo-400',
  gradientVia = 'via-purple-300',
  gradientTo = 'to-pink-300',
  loaderColor = 'text-indigo-600',
}) => {
  return (
    <div className={`h-screen flex items-center justify-center bg-gradient-to-b ${gradientFrom} ${gradientVia} ${gradientTo}`}>
      <div className="text-center">
        <div className="relative">
          {/* Outer glow effect */}
          <div className={`absolute inset-0 ${loaderColor.replace('text-', 'bg-')} blur-xl opacity-30 animate-pulse rounded-full scale-150`} />

          {/* Loader icon */}
          <Loader2
            size={48}
            className={`${loaderColor} animate-spin mx-auto mb-4 relative z-10`}
          />
        </div>

        <p className="text-gray-700 font-medium text-lg">{title}</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
});

AdminPageSkeleton.displayName = 'AdminPageSkeleton';

// ============================================
// VARIANTES PREDEFINIDAS POR SECCION
// ============================================

/** Skeleton para Books Management */
export const BooksManagementSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando libros..."
    gradientFrom="from-indigo-400"
    gradientVia="via-purple-300"
    gradientTo="to-pink-300"
    loaderColor="text-indigo-600"
  />
));
BooksManagementSkeleton.displayName = 'BooksManagementSkeleton';

/** Skeleton para Categories */
export const CategoriesSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando categorias..."
    gradientFrom="from-amber-400"
    gradientVia="via-orange-300"
    gradientTo="to-yellow-300"
    loaderColor="text-amber-600"
  />
));
CategoriesSkeleton.displayName = 'CategoriesSkeleton';

/** Skeleton para Authors */
export const AuthorsSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando autores..."
    gradientFrom="from-violet-400"
    gradientVia="via-purple-300"
    gradientTo="to-indigo-300"
    loaderColor="text-violet-600"
  />
));
AuthorsSkeleton.displayName = 'AuthorsSkeleton';

/** Skeleton para Genres */
export const GenresSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando generos..."
    gradientFrom="from-purple-400"
    gradientVia="via-violet-300"
    gradientTo="to-indigo-300"
    loaderColor="text-purple-600"
  />
));
GenresSkeleton.displayName = 'GenresSkeleton';

/** Skeleton para Levels */
export const LevelsSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando niveles..."
    gradientFrom="from-green-400"
    gradientVia="via-emerald-300"
    gradientTo="to-teal-300"
    loaderColor="text-green-600"
  />
));
LevelsSkeleton.displayName = 'LevelsSkeleton';

/** Skeleton para Tags */
export const TagsSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando etiquetas..."
    gradientFrom="from-teal-400"
    gradientVia="via-cyan-300"
    gradientTo="to-blue-300"
    loaderColor="text-teal-600"
  />
));
TagsSkeleton.displayName = 'TagsSkeleton';

/** Skeleton para Languages */
export const LanguagesSkeleton = memo(() => (
  <AdminPageSkeleton
    title="Cargando idiomas..."
    gradientFrom="from-cyan-400"
    gradientVia="via-cyan-300"
    gradientTo="to-blue-300"
    loaderColor="text-cyan-600"
  />
));
LanguagesSkeleton.displayName = 'LanguagesSkeleton';
