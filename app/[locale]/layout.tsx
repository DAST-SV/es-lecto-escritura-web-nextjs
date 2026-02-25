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
import { routing, type Locale } from '@/src/infrastructure/config/routing.config';
import { QueryProvider } from '@/src/presentation/providers/query-provider';
import { PWARegister } from '@/src/presentation/components/PWARegister';
import { PullToRefresh } from '@/src/presentation/components/PullToRefresh';

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

  const validLocale = locale as Locale;

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
        {/* ✅ PWA Splash: libro abriéndose — SOLO en cold start (no reload/navegación) */}
        <div id="pwa-splash" style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'none',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 40%, #6ee7b7 100%)',
          transition: 'opacity 0.6s ease-out',
          fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif",
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {/* Libro 3D abriéndose */}
            <div className="splash-book" style={{ perspective: '600px', width: 120, height: 140 }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
                {/* Sombra del libro */}
                <div style={{
                  position: 'absolute', bottom: -8, left: '10%', width: '80%', height: 12,
                  background: 'rgba(0,0,0,0.15)', borderRadius: '50%',
                  animation: 'book-shadow 2s ease-in-out infinite',
                }} />
                {/* Contratapa (fondo) */}
                <div style={{
                  position: 'absolute', inset: 0, background: '#1e40af', borderRadius: 6,
                  boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                }} />
                {/* Páginas interiores */}
                <div style={{
                  position: 'absolute', top: 4, left: 4, right: 4, bottom: 4,
                  background: '#fefce8', borderRadius: '2px 4px 4px 2px',
                }}>
                  {/* Líneas de texto animadas */}
                  <div style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ height: 4, background: '#c4b5fd', borderRadius: 2, width: '90%', animation: 'text-appear 2s ease-in-out infinite' }} />
                    <div style={{ height: 4, background: '#93c5fd', borderRadius: 2, width: '70%', animation: 'text-appear 2s ease-in-out 0.2s infinite' }} />
                    <div style={{ height: 4, background: '#86efac', borderRadius: 2, width: '85%', animation: 'text-appear 2s ease-in-out 0.4s infinite' }} />
                    <div style={{ height: 4, background: '#fcd34d', borderRadius: 2, width: '60%', animation: 'text-appear 2s ease-in-out 0.6s infinite' }} />
                    <div style={{ height: 4, background: '#fca5a5', borderRadius: 2, width: '75%', animation: 'text-appear 2s ease-in-out 0.8s infinite' }} />
                  </div>
                </div>
                {/* Portada — se abre */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  borderRadius: 6, transformOrigin: 'left center',
                  animation: 'book-open 2.5s ease-in-out infinite',
                  boxShadow: '4px 0 12px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>E</span>
                  {/* Decoración de la portada */}
                  <div style={{
                    position: 'absolute', bottom: 12, left: 12, right: 12,
                    height: 3, background: '#fde047', borderRadius: 2,
                  }} />
                  <div style={{
                    position: 'absolute', top: 12, left: 12, right: 12,
                    height: 3, background: '#fde047', borderRadius: 2,
                  }} />
                </div>
                {/* Letras que salen volando del libro */}
                <div style={{ position: 'absolute', top: '30%', left: '60%' }}>
                  <span style={{ position: 'absolute', fontSize: 16, fontWeight: 900, color: '#fbbf24', animation: 'letter-fly-1 2.5s ease-out infinite', opacity: 0 }}>A</span>
                  <span style={{ position: 'absolute', fontSize: 14, fontWeight: 900, color: '#34d399', animation: 'letter-fly-2 2.5s ease-out 0.3s infinite', opacity: 0 }}>B</span>
                  <span style={{ position: 'absolute', fontSize: 18, fontWeight: 900, color: '#f472b6', animation: 'letter-fly-3 2.5s ease-out 0.5s infinite', opacity: 0 }}>C</span>
                </div>
              </div>
            </div>
            {/* Texto de marca */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                ESLectoEscritura
              </div>
              {/* Dots de carga */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'splash-dot 1.2s ease-in-out infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'splash-dot 1.2s ease-in-out 0.2s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'splash-dot 1.2s ease-in-out 0.4s infinite' }} />
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes book-open {
              0%, 15% { transform: rotateY(0deg); }
              40%, 70% { transform: rotateY(-160deg); }
              85%, 100% { transform: rotateY(0deg); }
            }
            @keyframes book-shadow {
              0%, 15%, 85%, 100% { transform: scaleX(1); opacity: 0.15; }
              40%, 70% { transform: scaleX(1.3); opacity: 0.08; }
            }
            @keyframes text-appear {
              0%, 15% { opacity: 0; transform: scaleX(0); }
              40%, 70% { opacity: 1; transform: scaleX(1); }
              85%, 100% { opacity: 0; transform: scaleX(0); }
            }
            @keyframes letter-fly-1 {
              0%, 30% { opacity: 0; transform: translate(0,0) scale(0.5); }
              50% { opacity: 1; transform: translate(-20px,-40px) scale(1) rotate(-15deg); }
              80%, 100% { opacity: 0; transform: translate(-40px,-70px) scale(0.3) rotate(-30deg); }
            }
            @keyframes letter-fly-2 {
              0%, 35% { opacity: 0; transform: translate(0,0) scale(0.5); }
              55% { opacity: 1; transform: translate(15px,-50px) scale(1) rotate(10deg); }
              85%, 100% { opacity: 0; transform: translate(30px,-80px) scale(0.3) rotate(20deg); }
            }
            @keyframes letter-fly-3 {
              0%, 38% { opacity: 0; transform: translate(0,0) scale(0.5); }
              58% { opacity: 1; transform: translate(-5px,-45px) scale(1.1) rotate(-8deg); }
              88%, 100% { opacity: 0; transform: translate(-10px,-75px) scale(0.3) rotate(-16deg); }
            }
            @keyframes splash-dot {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1.4); }
            }
          `}} />
        </div>
        {/* Script: mostrar splash SOLO en cold start de PWA (no reload ni navegación) */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var KEY = '__eslecto_splash_shown__';
            var splash = document.getElementById('pwa-splash');
            if (!splash) return;

            // Solo mostrar si es la primera carga de esta sesión del browser/PWA
            // sessionStorage se limpia al cerrar la app/pestaña
            if (sessionStorage.getItem(KEY)) {
              splash.remove();
              return;
            }

            // Marcar que ya se mostró para esta sesión
            sessionStorage.setItem(KEY, '1');
            splash.style.display = 'flex';

            var done = false;
            function hide() {
              if (done) return;
              done = true;
              splash.style.opacity = '0';
              setTimeout(function(){ splash.remove(); }, 600);
            }

            // Ocultar cuando React termine de renderizar
            if (document.readyState === 'complete') {
              setTimeout(hide, 1800);
            } else {
              window.addEventListener('load', function(){ setTimeout(hide, 1200); });
            }
            // Máximo 5s
            setTimeout(hide, 5000);
          })();
        `}} />

        {/* PWA: Service Worker Registration + Pull-to-Refresh mobile */}
        <PWARegister />
        <PullToRefresh />
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