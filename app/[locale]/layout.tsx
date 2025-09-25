// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/src/i18n/routing';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import "../globals.css";
import NavBar from '@/src/components/nav/NavBar';

// Usa los tipos exactos que Next.js espera
interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>; // Next.js espera string genérico
}

// Genera parámetros estáticos para las rutas
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Genera metadata dinámica basada en el locale
export async function generateMetadata({
  params
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;

  // Validación de locale usando la función de tu config
  if (!routing.locales.includes(locale as any)) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  const t = await getTranslations({ locale, namespace: 'layout' });

  return {
    title: t('meta.title'),
    description: t('meta.description')
  };
}

// Componente principal del layout
export default async function RootLayout({
  children,
  params
}: LayoutProps) {
  const { locale } = await params;

  // Validación del locale - redirige a 404 si no es válido
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Type assertion para que TypeScript sepa que locale es válido después de la validación
  const validLocale = locale as 'en' | 'es';

  // Establece el locale para el request actual
  setRequestLocale(validLocale);

  return (
    <html lang={validLocale} className="bg-gray-100">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Itim&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Oswald:wght@400;700&family=Ubuntu:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=PT+Sans:wght@400;700&family=Indie+Flower&family=Cabin:wght@400;700&family=Fira+Sans:wght@400;700&family=Comfortaa:wght@400;700&family=Varela+Round&family=Work+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}