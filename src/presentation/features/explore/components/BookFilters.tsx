/**
 * ============================================
 * COMPONENTE: BookFilters
 * Panel de filtros para exploracion de libros
 * TODAS las traducciones son dinamicas
 * ============================================
 */

'use client';

import React, { memo, useState } from 'react';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  SortAsc,
  Layers,
  Tag,
  BookOpen,
  Lock,
  Users,
} from 'lucide-react';
import { BookExploreFilters, CatalogItemTranslated, LevelItemTranslated, BookSortOption, AccessType } from '@/src/core/domain/types';
import { FilterChip } from './FilterChip';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// ============================================
// TIPOS
// ============================================

interface BookFiltersProps {
  filters: BookExploreFilters;
  onFilterChange: (filters: BookExploreFilters) => void;
  onClearFilters: () => void;
  categories: CatalogItemTranslated[];
  genres: CatalogItemTranslated[];
  levels: LevelItemTranslated[];
  isLoading: boolean;
  hasActiveFilters: boolean;
}

// ============================================
// FILTER SECTION
// ============================================

interface FilterSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = memo(
  ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="border-b border-yellow-200 last:border-b-0">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-yellow-50/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-blue-600" />
            <span
              className="font-bold text-blue-800 text-sm"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {title}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isOpen && <div className="pb-3 px-1">{children}</div>}
      </div>
    );
  }
);

FilterSection.displayName = 'FilterSection';

// ============================================
// SKELETON
// ============================================

export const BookFiltersSkeleton: React.FC = memo(() => {
  return (
    <div className="bg-white rounded-3xl border-4 border-yellow-300 shadow-xl p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded-full w-28" />
      </div>

      {/* Sections */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border-b border-yellow-100 py-3">
          <div className="h-5 bg-slate-200 rounded w-32 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-8 bg-slate-200 rounded-full w-20" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

BookFiltersSkeleton.displayName = 'BookFiltersSkeleton';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const BookFilters: React.FC<BookFiltersProps> = memo(
  ({
    filters,
    onFilterChange,
    onClearFilters,
    categories,
    genres,
    levels,
    isLoading,
    hasActiveFilters,
  }) => {
    const { t, loading: translationsLoading } = useSupabaseTranslations('book_filters');

    // Opciones de ordenamiento con traducciones
    const SORT_OPTIONS: { value: BookSortOption; label: string }[] = [
      { value: 'recent', label: t('sort.recent') },
      { value: 'popular', label: t('sort.popular') },
      { value: 'rating', label: t('sort.rating') },
      { value: 'title_asc', label: t('sort.title_asc') },
      { value: 'title_desc', label: t('sort.title_desc') },
    ];

    // Opciones de acceso con traducciones
    const ACCESS_OPTIONS: { value: AccessType; label: string; icon: React.ElementType }[] = [
      { value: 'public', label: t('access.public'), icon: BookOpen },
      { value: 'freemium', label: t('access.freemium'), icon: Sparkles },
      { value: 'premium', label: t('access.premium'), icon: Lock },
      { value: 'community', label: t('access.community'), icon: Users },
    ];

    // Helpers para toggle de filtros
    const toggleCategory = (id: number) => {
      const current = filters.categories || [];
      const updated = current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id];
      onFilterChange({ ...filters, categories: updated });
    };

    const toggleGenre = (id: number) => {
      const current = filters.genres || [];
      const updated = current.includes(id)
        ? current.filter((g) => g !== id)
        : [...current, id];
      onFilterChange({ ...filters, genres: updated });
    };

    const toggleLevel = (id: number) => {
      const current = filters.levels || [];
      const updated = current.includes(id)
        ? current.filter((l) => l !== id)
        : [...current, id];
      onFilterChange({ ...filters, levels: updated });
    };

    const toggleAccessType = (type: AccessType) => {
      const current = filters.accessTypes || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      onFilterChange({ ...filters, accessTypes: updated });
    };

    const setSortBy = (sortBy: BookSortOption) => {
      onFilterChange({ ...filters, sortBy });
    };

    if (isLoading || translationsLoading) {
      return <BookFiltersSkeleton />;
    }

    return (
      <div className="bg-white rounded-3xl border-4 border-yellow-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-5 py-4 border-b-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2
                className="font-black text-blue-800"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                {t('title')}
              </h2>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-red-500 text-xs font-bold rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
              >
                <X className="w-3 h-3" />
                {t('clear')}
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-1">
          {/* Ordenar por */}
          <FilterSection title={t('sort.title')} icon={SortAsc} defaultOpen={true}>
            <select
              value={filters.sortBy || 'recent'}
              onChange={(e) => setSortBy(e.target.value as BookSortOption)}
              className="w-full p-2 rounded-xl border-2 border-yellow-200 text-sm font-bold text-blue-800 bg-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Categorias */}
          {categories.length > 0 && (
            <FilterSection title={t('categories')} icon={Layers} defaultOpen={true}>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    isSelected={(filters.categories || []).includes(category.id)}
                    onToggle={() => toggleCategory(category.id)}
                    colorScheme={(['yellow', 'green', 'blue', 'pink', 'purple', 'orange'] as const)[index % 6]}
                    size="sm"
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Generos */}
          {genres.length > 0 && (
            <FilterSection title={t('genres')} icon={Tag} defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <FilterChip
                    key={genre.id}
                    label={genre.name}
                    isSelected={(filters.genres || []).includes(genre.id)}
                    onToggle={() => toggleGenre(genre.id)}
                    colorScheme={(['pink', 'purple', 'blue', 'green', 'orange', 'yellow'] as const)[index % 6]}
                    size="sm"
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Niveles de lectura */}
          {levels.length > 0 && (
            <FilterSection title={t('levels')} icon={BookOpen} defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <FilterChip
                    key={level.id}
                    label={`${level.name} (${level.minAge}-${level.maxAge} ${t('years')})`}
                    isSelected={(filters.levels || []).includes(level.id)}
                    onToggle={() => toggleLevel(level.id)}
                    colorScheme="blue"
                    size="sm"
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Tipo de acceso */}
          <FilterSection title={t('access')} icon={Lock} defaultOpen={false}>
            <div className="flex flex-wrap gap-2">
              {ACCESS_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleAccessType(option.value)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                      border-2 transition-all duration-200 shadow-sm
                      ${
                        (filters.accessTypes || []).includes(option.value)
                          ? 'bg-blue-400 border-blue-500 text-white'
                          : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                      }
                    `}
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        </div>
      </div>
    );
  }
);

BookFilters.displayName = 'BookFilters';

export default BookFilters;
