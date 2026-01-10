// ============================================
// src/infrastructure/config/routing.config.ts
// ============================================
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { i18nConfig } from './i18n.config';

export const routing = defineRouting({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  pathnames: {
    '/': {
      en: '/',
      es: '/'
    },
    '/auth/login': {
      en: '/auth/login',
      es: '/auth/ingresar'
    },
    '/auth/register': {
      en: '/auth/register',
      es: '/auth/registro'
    },
    '/pages-my-books': {
      en: '/my-books',
      es: '/mis-libros'
    },
    '/books/create': {
      en: '/books/create',
      es: '/libros/crear'
    },
    '/library': {
      en: '/library',
      es: '/biblioteca'
    },
    '/my-world': {
      en: '/my-world',
      es: '/mi-mundo'
    },
    '/my-progress': {
      en: '/my-progress',
      es: '/mi-progreso'
    },
    '/diary/my-diaries': {
      en: '/diary/my-diaries',
      es: '/diario/mis-diarios'
    },
    '/test-supabase': {
      en: '/test-supabase',
      es: '/test-supabase',
      fr: '/test-supabase'
    }
  }
});

// ✅ Exportar las funciones de navegación
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);