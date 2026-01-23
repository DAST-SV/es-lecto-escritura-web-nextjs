// ============================================
// src/presentation/features/navigation/hooks/useNavigation.ts
// ✅ MIGRADO: Usa useSupabaseTranslations en lugar de next-intl
// ============================================

"use client";

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Locale } from '@/src/core/domain/value-objects';
import { GetNavigationItems } from '@/src/core/application/use-cases/navigation';
import { useSupabaseTranslations } from '../../translations/hooks/useSupabaseTranslations';

export const useNavigation = (isAuthenticated: boolean) => {
  const locale = useLocale();
  const { t, loading } = useSupabaseTranslations('nav');

  const navigationItems = useMemo(() => {
    // Si aún está cargando, retornar array vacío
    if (loading) return [];

    const getNavigationItems = new GetNavigationItems();
    const currentLocale = Locale.fromString(locale);

    const translator = (key: string) => ({
      text: t(`${key}.text`),
      href: t(`${key}.href`),
      title: t(`${key}.title`),
    });

    return getNavigationItems.execute(isAuthenticated, currentLocale, translator);
  }, [isAuthenticated, locale, t, loading]);

  return { navigationItems, loading };
};