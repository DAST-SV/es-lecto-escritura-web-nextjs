// ============================================
// app/[locale]/layout.tsx
// ✅ CORREGIDO: NextIntlClientProvider con locale y messages
// ✅ TanStack Query Provider integrado
// ============================================

import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Metadata, Viewport } from 'next';
import { ReactNode, Suspense } from 'react';
import "../globals.css";
import Loading from './loading';
import { routing } from '@/src/infrastructure/config/routing.config';
import { QueryProvider } from '@/src/presentation/providers/query-provider';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// ============================================
// VIEWPORT — crítico para mobile rendering correcto
// Sin esto el browser móvil trata la página como desktop y escala mal
// ============================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // para notch de iPhone
  themeColor: '#60b8f5', // color de la barra de estado móvil (azul de la app)
};

// ============================================
// GENERAR PARÁMETROS ESTÁTICOS
// ============================================
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ============================================
// GENERAR METADATA
// ============================================
export async function generateMetadata({
  params
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;

  // Validación del locale
  if (!routing.locales.includes(locale as any)) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  // ✅ Usar traducciones seguras con fallback
  const titles: Record<string, string> = {
    es: 'Eslectoescritura - Aprende a leer y escribir',
    en: 'Eslectoescritura - Learn to read and write',
    fr: 'Eslectoescritura - Apprenez à lire et écrire'
  };

  const descriptions: Record<string, string> = {
    es: 'Plataforma educativa para aprender lectoescritura de forma divertida',
    en: 'Educational platform to learn reading and writing in a fun way',
    fr: 'Plateforme éducative pour apprendre la lecture et l\'écriture de manière amusante'
  };

  return {
    title: titles[locale] || titles.es,
    description: descriptions[locale] || descriptions.es
  };
}

// ============================================
// LAYOUT PRINCIPAL
// ============================================
export default async function RootLayout({
  children,
  params
}: LayoutProps) {
  const { locale } = await params;

  // Validación del locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // ✅ Tipo correcto con los 3 idiomas
  const validLocale = locale as 'en' | 'es' | 'fr';

  // Establecer locale para la solicitud
  setRequestLocale(validLocale);

  // ✅ CRÍTICO: Obtener mensajes de traducciones
  const messages = await getMessages();

  return (
    <html lang={validLocale} className="bg-gray-100">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Itim&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Oswald:wght@400;700&family=Ubuntu:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=PT+Sans:wght@400;700&family=Indie+Flower&family=Cabin:wght@400;700&family=Fira+Sans:wght@400;700&family=Comfortaa:wght@400;700&family=Varela+Round&family=Work+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA: Web App Manifest para pantalla completa en móvil */}
        <link rel="manifest" href="/manifest.json" />
        {/* iOS Safari: pantalla completa al agregar a pantalla de inicio */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Eslecto" />
        {/* Android: pantalla completa */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {/* ✅ CORREGIDO: Pasar locale y messages */}
        <NextIntlClientProvider locale={validLocale} messages={messages}>
          {/* ✅ TanStack Query para manejo de estado del servidor */}
          <QueryProvider>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}