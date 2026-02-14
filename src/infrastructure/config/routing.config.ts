// ============================================
// src/infrastructure/config/routing.config.ts
// Rutas públicas estáticas como fallback.
// Las rutas protegidas se cargan dinámicamente desde Supabase.
// Los locales vienen de generated-locales.ts (fuente: app.languages)
// ============================================

import { LocalePrefix } from 'next-intl/routing';
import { locales, defaultLocale, type Locale } from './generated-locales';

export { locales, defaultLocale, type Locale };

// ============================================
// RUTAS PÚBLICAS (fallback cuando Supabase no responde)
// El proxy se encarga de la traducción real desde route_translations
// ============================================
export const publicPathnames = {
  '/': '/',
  '/error': '/error',
  '/auth/callback': '/auth/callback',
  '/auth/login': '/auth/login',
  '/auth/register': '/auth/register',
} as const;

// ============================================
// CONFIGURACIÓN BASE
// ============================================
export const localePrefix: LocalePrefix<typeof locales> = 'always';

// ============================================
// ROUTING CONFIG (usado por next-intl y layout.tsx)
// ============================================
export const routing = {
  locales,
  defaultLocale,
  localePrefix,
  pathnames: publicPathnames,
};
