// ============================================
// src/infrastructure/config/routing.config.ts
// Configuración de routing con soporte DINÁMICO
// ============================================

import { Pathnames, LocalePrefix } from 'next-intl/routing';

// RUTAS PÚBLICAS (estáticas en código)
export const publicPathnames = {
  '/': '/',
  '/about': {
    es: '/acerca-de',
    en: '/about',
    fr: '/a-propos',
    it: '/chi-siamo'
  },
  '/error': '/error',
  '/forbidden': '/forbidden',
  '/auth/callback': '/auth/callback',
  '/auth/login': {
    es: '/auth/ingresar',
    en: '/auth/login',
    fr: '/auth/connexion',
    it: '/auth/accesso'
  },
  '/auth/register': {
    es: '/auth/registro',
    en: '/auth/register',
    fr: '/auth/inscription',
    it: '/auth/registrazione'
  },
} as const satisfies Pathnames<readonly ['es', 'en', 'fr', 'it']>;

// Configuración base
export const locales = ['es', 'en', 'fr', 'it'] as const;
export const defaultLocale = 'es' as const;
export const localePrefix: LocalePrefix<typeof locales> = 'always';

// Configuración de routing (se combina con rutas dinámicas en middleware)
export const routing = {
  locales,
  defaultLocale,
  localePrefix,
  pathnames: publicPathnames, // Solo rutas públicas aquí
};

export type Locale = (typeof locales)[number];