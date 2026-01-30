/**
 * ============================================
 * LOADING: Explorar Libros
 * Skeleton loading para la página de exploración
 * ============================================
 */

'use client';

import React from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import {
  ExploreHeroSkeleton,
  FeaturedBooksSkeleton,
  BookFiltersSkeleton,
  BookCardSkeleton,
} from '@/src/presentation/features/explore';

const ExploreLoading: React.FC = () => {
  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      {/* Hero skeleton */}
      <ExploreHeroSkeleton />

      {/* Featured skeleton */}
      <FeaturedBooksSkeleton />

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros skeleton */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <BookFiltersSkeleton />
          </aside>

          {/* Grid skeleton */}
          <main className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <BookCardSkeleton key={index} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default ExploreLoading;
