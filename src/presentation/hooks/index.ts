// ============================================
// src/presentation/hooks/index.ts
// Barrel export de hooks compartidos
// ============================================

export { useLanguages } from './useLanguages';
export { useTranslationNamespaces } from './useTranslationNamespaces';
export { useCurrentLocale, getCurrentLocale, getLocaleFromPathname, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './useCurrentLocale';
export type { SupportedLocale } from './useCurrentLocale';
