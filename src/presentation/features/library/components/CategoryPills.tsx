// src/presentation/features/library/components/CategoryPills.tsx
/**
 * ============================================
 * COMPONENTE: CategoryPills
 * Filtros de categoria horizontales scrollables
 * Estilo visual infantil/educativo
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { memo, useCallback } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// TIPOS
// ============================================

interface CategoryPillData {
  id: string;
  slug: string;
  name: string;
  bookCount: number;
}

interface CategoryPillsProps {
  categories: CategoryPillData[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  isLoading: boolean;
}

// ============================================
// SKELETON
// ============================================

const SKELETON_WIDTHS = [76, 88, 64, 92, 70, 84, 78, 68];

export const CategoryPillsSkeleton: React.FC = memo(() => {
  return (
    <div className="flex gap-2 overflow-hidden py-4 px-4">
      {SKELETON_WIDTHS.map((width, i) => (
        <div
          key={i}
          className="flex-shrink-0 h-10 rounded-full bg-white/50 animate-pulse"
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  );
});

CategoryPillsSkeleton.displayName = 'CategoryPillsSkeleton';

// ============================================
// PILL INDIVIDUAL
// ============================================

const CategoryPill: React.FC<{
  id: string | null;
  name: string;
  bookCount?: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  icon?: React.ReactNode;
}> = memo(({ id, name, bookCount, isSelected, onSelect, icon }) => {
  const handleClick = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-bold transition-all duration-200 ${
        isSelected
          ? 'bg-yellow-300 border-yellow-400 text-blue-800 shadow-lg scale-105'
          : 'bg-white/80 border-yellow-200 text-blue-700 hover:bg-yellow-50 hover:border-yellow-300 hover:scale-105'
      }`}
      style={{ fontFamily: 'Comic Sans MS, cursive' }}
    >
      {icon}
      <span>{name}</span>
      {bookCount != null && bookCount > 0 && (
        <span
          className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
            isSelected
              ? 'bg-blue-800 text-yellow-300'
              : 'bg-blue-100 text-blue-600'
          }`}
        >
          {bookCount}
        </span>
      )}
    </button>
  );
});

CategoryPill.displayName = 'CategoryPill';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const CategoryPills: React.FC<CategoryPillsProps> = memo(
  ({ categories, selectedCategory, onSelect, isLoading }) => {
    const { t, loading: translationsLoading } = useSupabaseTranslations('library');

    // Textos traducidos con fallback
    const allLabel = translationsLoading ? 'Todos' : t('filters.all');

    // Mostrar skeleton mientras carga
    if (isLoading || translationsLoading) {
      return <CategoryPillsSkeleton />;
    }

    // Calcular total de libros para el pill "Todos"
    const totalBooks = categories.reduce((sum, cat) => sum + cat.bookCount, 0);

    return (
      <div
        className="flex gap-2 overflow-x-auto py-4 px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Pill "Todos" siempre primero */}
        <CategoryPill
          id={null}
          name={allLabel}
          bookCount={totalBooks}
          isSelected={selectedCategory === null}
          onSelect={onSelect}
          icon={<LayoutGrid className="w-3.5 h-3.5" />}
        />

        {/* Pills de categorias */}
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            id={category.id}
            name={category.name}
            bookCount={category.bookCount}
            isSelected={selectedCategory === category.id}
            onSelect={onSelect}
          />
        ))}

        {/* Ocultar scrollbar con CSS */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  }
);

CategoryPills.displayName = 'CategoryPills';

export default CategoryPills;
