// ============================================
// src/infrastructure/config/routing.config.ts
// ============================================

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { i18nConfig } from './i18n.config';

// ✅ Pathnames dinámicos se cargarán desde Supabase
export const routing = defineRouting({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  // Los pathnames se cargarán dinámicamente en middleware
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);