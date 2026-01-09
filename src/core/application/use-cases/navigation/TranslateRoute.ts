// ============================================
// src/core/application/use-cases/navigation/TranslateRoute.ts
// ============================================

import { Locale } from '@/src/core/domain/value-objects/Locale';

export class TranslateRoute {
  private routeTranslations: Record<string, Record<string, string>> = {
    es: {
      '/auth/login': '/auth/ingresar',
      '/auth/register': '/auth/registro',
    },
    en: {
      '/auth/ingresar': '/auth/login',
      '/auth/registro': '/auth/register',
    },
  };

  execute(path: string, fromLocale: Locale, toLocale: Locale): string {
    const translations = this.routeTranslations[toLocale.code];
    return translations?.[path] ?? path;
  }
}