// src/presentation/features/books-catalog/components/CategoryGrid.tsx
'use client';

import { useTranslations } from 'next-intl';
import { CategoryCard } from './CategoryCard';
import type { CategoryByLanguage } from '@/src/core/domain/entities/BookCategory';

interface CategoryGridProps {
  categories: CategoryByLanguage[];
  isLoading?: boolean;
}

export function CategoryGrid({ categories, isLoading }: CategoryGridProps) {
  const t = useTranslations('booksCatalog');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-gray-100 h-48"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('empty.noCategories')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
