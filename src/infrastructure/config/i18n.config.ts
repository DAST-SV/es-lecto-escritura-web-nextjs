// ============================================
// 5. src/infrastructure/config/i18n.config.ts
// ============================================
export const i18nConfig = {
  locales: ['en', 'es'] as const,
  defaultLocale: 'es',
  get lngs() {
    return this.locales.join('|');
  },
} as const;

export type LocalesType = typeof i18nConfig.locales;
export type Locale = LocalesType[number];

export function isLocale(value: string): value is Locale {
  return (i18nConfig.locales as readonly string[]).includes(value);
}