// ============================================
// 8. src/infrastructure/config/i18n.request.ts
// ============================================
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return { locale, messages };
});