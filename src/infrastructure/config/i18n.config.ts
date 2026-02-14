// src/infrastructure/config/i18n.config.ts
import { locales, defaultLocale, type Locale } from './generated-locales';

export { locales, defaultLocale, type Locale };

export const i18nConfig = {
  locales,
  defaultLocale,
  get lngs() {
    return this.locales.join('|');
  },
} as const;

export type LocalesType = typeof locales;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}