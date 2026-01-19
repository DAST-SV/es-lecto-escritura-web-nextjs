// ============================================
// src/infrastructure/config/routing.config.ts
// ✅ CORREGIDO: Solo rutas PÚBLICAS estáticas
// Las rutas protegidas se cargan dinámicamente
// ============================================

import { Pathnames, LocalePrefix } from 'next-intl/routing';

// ============================================
// SOLO RUTAS PÚBLICAS (hardcoded)
// ============================================
export const publicPathnames = {
  '/': '/',
  '/error': '/error',
  '/auth/callback': '/auth/callback',
  '/auth/login': {
    es: '/auth/ingresar',
    en: '/auth/login',
    fr: '/auth/connexion'
  },
  '/auth/register': {
    es: '/auth/registro',
    en: '/auth/register',
    fr: '/auth/inscription'
  },
} as const satisfies Pathnames<readonly ['es', 'en', 'fr']>;

// ============================================
// CONFIGURACIÓN BASE
// ============================================
export const locales = ['es', 'en', 'fr'] as const;
export const defaultLocale = 'es' as const;
export const localePrefix: LocalePrefix<typeof locales> = 'always';

// ============================================
// ROUTING CONFIG
// ============================================
export const routing = {
  locales,
  defaultLocale,
  localePrefix,
  pathnames: publicPathnames, // Solo rutas públicas
};

export type Locale = (typeof locales)[number];