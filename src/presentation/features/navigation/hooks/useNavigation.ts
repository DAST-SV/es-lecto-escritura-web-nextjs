// ============================================
// src/presentation/features/navigation/hooks/useNavigation.ts
// ============================================

"use client";

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Locale } from '@/src/core/domain/value-objects';
import { GetNavigationItems } from '@/src/core/application/use-cases/navigation';

export const useNavigation = (isAuthenticated: boolean) => {
  const locale = useLocale();
  const t = useTranslations('nav');

  const navigationItems = useMemo(() => {
    const getNavigationItems = new GetNavigationItems();
    const currentLocale = Locale.fromString(locale);

    const translator = (key: string) => ({
      text: t(`${key}.text`),
      href: t(`${key}.href`),
      title: t(`${key}.title`),
    });

    return getNavigationItems.execute(isAuthenticated, currentLocale, translator);
  }, [isAuthenticated, locale, t]);

  return { navigationItems };
};