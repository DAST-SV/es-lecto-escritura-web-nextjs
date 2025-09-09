// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/src/i18n/routing';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import "../globals.css";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: (typeof routing.locales)[number] }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: 'layout' });
  return {
    title: t('meta.title'),
    description: t('meta.description')
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: (typeof routing.locales)[number] }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
