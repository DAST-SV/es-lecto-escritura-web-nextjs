// ============================================
// app/[locale]/layout.tsx
// ✅ CORREGIDO: NextIntlClientProvider con locale y messages
// ✅ TanStack Query Provider integrado
// ✅ PWA: manifest, service worker, meta tags
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
import { PWARegister } from '@/src/presentation/components/PWARegister';

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
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
    description: descriptions[locale] || descriptions.es,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Eslecto',
    },
    icons: {
      icon: [
        { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [
        { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
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
        {/* PWA: Apple touch icon */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Android: pantalla completa */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {/* PWA: Service Worker Registration */}
        <PWARegister />
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