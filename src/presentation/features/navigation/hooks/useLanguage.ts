// ============================================
// src/presentation/features/navigation/hooks/useLanguage.ts
// ============================================

"use client";

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { TranslateRoute } from '@/src/core/application/use-cases/navigation/TranslateRoute';
import { Locale } from '@/src/core/domain/value-objects/Locale';
import { Route } from '@/src/core/domain/value-objects/Route';

export const useLanguage = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = Locale.fromString(locale);
  const translateRoute = new TranslateRoute();

  const changeLanguage = (newLocaleCode: string) => {
    const currentRoute = Route.fromPathname(pathname);
    const newLocale = Locale.fromString(newLocaleCode);

    const translatedPath = translateRoute.execute(
      currentRoute.path,
      currentLocale,
      newLocale
    );

    const newRoute = new Route(translatedPath, newLocale);
    const newPath = `${newRoute.toLocalizedPath()}${window.location.hash}`;

    router.push(newPath, { scroll: false });
    setIsOpen(false);
    document.documentElement.lang = newLocaleCode;
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return {
    currentLocale,
    isOpen,
    setIsOpen,
    changeLanguage,
  };
};