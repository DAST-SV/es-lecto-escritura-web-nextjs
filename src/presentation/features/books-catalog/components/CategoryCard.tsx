// src/presentation/features/books-catalog/components/CategoryCard.tsx
'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  BookOpen,
  Feather,
  Sparkles,
  Castle,
  MessageCircle,
  Music,
  Image,
  HelpCircle,
  GraduationCap,
  Folder
} from 'lucide-react';
import type { CategoryByLanguage } from '@/src/core/domain/entities/BookCategory';
import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  BookOpen,
  Feather,
  Sparkles,
  Castle,
  MessageCircle,
  Music,
  Image,
  HelpCircle,
  GraduationCap,
  Folder
};

interface CategoryCardProps {
  category: CategoryByLanguage;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const locale = useLocale();
  const t = useTranslations('booksCatalog');
  const IconComponent = iconMap[category.icon || ''] || Folder;

  return (
    <Link
      href={`/${locale}/library/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: category.color || '#3B82F6' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${category.color || '#3B82F6'}20` }}
        >
          <IconComponent
            className="w-7 h-7"
            style={{ color: category.color || '#3B82F6' }}
          />
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {category.description}
          </p>
        )}

        {/* Book counter */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <BookOpen className="w-4 h-4" />
          <span>
            {category.bookCount} {category.bookCount === 1 ? t('meta.book') : t('meta.books')}
          </span>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
