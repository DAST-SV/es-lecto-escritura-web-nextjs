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
import { NavigationProvider } from '@/src/presentation/providers/navigation-provider';
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
        {/* ── Overlays DOM puro: splash cold-start + nav loading ── */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            /* ═══ ESTILOS COMPARTIDOS (inyectados una sola vez) ═══ */
            var st=document.createElement('style');
            st.textContent=
              '@keyframes nl-cover{0%,12%{transform:rotateY(0)}42%,62%{transform:rotateY(-155deg)}88%,100%{transform:rotateY(0)}}'+
              '@keyframes nl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'+
              '@keyframes nl-sh{0%,100%{opacity:.35}50%{opacity:1}}'+
              '@keyframes sp-open{0%{transform:rotateY(0)}100%{transform:rotateY(-160deg)}}'+
              '@keyframes sp-glow{0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.3)}50%{box-shadow:0 0 40px rgba(59,130,246,0.6)}}'+
              '@keyframes sp-letter{0%{opacity:0;transform:translateY(20px) scale(0.5)}60%{opacity:1;transform:translateY(-5px) scale(1.1)}100%{opacity:1;transform:translateY(0) scale(1)}}'+
              '@keyframes sp-fadeout{0%{opacity:1}100%{opacity:0}}';
            document.head.appendChild(st);

            /* ─── helper: crea el libro animado (reutilizado en ambos overlays) ─── */
            function bookHTML(size,coverAnim,floatAnim){
              var w=size,h=Math.round(size*1.22);
              return '<div style="perspective:400px;width:'+w+'px;height:'+h+'px;margin:0 auto 16px;">'+
                '<div style="width:100%;height:100%;position:relative;transform-style:preserve-3d;animation:'+floatAnim+';">'+
                  '<div style="position:absolute;left:-5px;top:0;width:5px;height:100%;background:linear-gradient(to right,#1e40af,#2563eb);border-radius:3px 0 0 3px;z-index:3;"></div>'+
                  '<div style="position:absolute;inset:0;background:#1e3a8a;border-radius:0 4px 4px 0;box-shadow:2px 2px 10px rgba(0,0,0,0.15);"></div>'+
                  '<div style="position:absolute;top:2px;left:2px;right:2px;bottom:2px;background:#f8fafc;border-radius:0 3px 3px 0;">'+
                    '<div style="padding:8px 6px;display:flex;flex-direction:column;gap:4px;">'+
                      '<div style="height:3px;background:#bfdbfe;border-radius:1px;width:88%;animation:nl-sh 1.8s ease infinite;"></div>'+
                      '<div style="height:3px;background:#93c5fd;border-radius:1px;width:62%;animation:nl-sh 1.8s ease .15s infinite;"></div>'+
                      '<div style="height:3px;background:#bfdbfe;border-radius:1px;width:78%;animation:nl-sh 1.8s ease .3s infinite;"></div>'+
                      '<div style="height:3px;background:#93c5fd;border-radius:1px;width:50%;animation:nl-sh 1.8s ease .45s infinite;"></div>'+
                      '<div style="height:3px;background:#bfdbfe;border-radius:1px;width:70%;animation:nl-sh 1.8s ease .6s infinite;"></div>'+
                    '</div>'+
                  '</div>'+
                  '<div style="position:absolute;inset:0;background:linear-gradient(145deg,#2563eb,#1d4ed8);border-radius:0 4px 4px 0;transform-origin:left center;animation:'+coverAnim+';box-shadow:4px 0 10px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;backface-visibility:hidden;z-index:2;">'+
                    '<span style="color:#fff;font-weight:900;font-size:'+Math.round(size*0.38)+'px;text-shadow:0 1px 4px rgba(0,0,0,0.3);">E</span>'+
                    '<div style="position:absolute;top:6px;left:6px;right:6px;height:2px;background:#fde047;border-radius:1px;opacity:.85;"></div>'+
                    '<div style="position:absolute;bottom:6px;left:6px;right:6px;height:2px;background:#fde047;border-radius:1px;opacity:.85;"></div>'+
                  '</div>'+
                '</div>'+
              '</div>';
            }

            /* ═══ 1. PWA COLD-START SPLASH ═══ */
            var KEY='__eslecto_splash_shown__';
            if(!sessionStorage.getItem(KEY)){
              sessionStorage.setItem(KEY,'1');
              var sp=document.createElement('div');
              sp.id='pwa-splash';
              sp.style.cssText='position:fixed;inset:0;z-index:100000;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#bfdbfe 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:Nunito,\\'Varela Round\\',Comfortaa,sans-serif;';
              sp.innerHTML=
                '<div style="animation:sp-glow 2s ease-in-out infinite;">'+
                  bookHTML(80,'sp-open 1.8s ease-out forwards','nl-float 2.5s ease-in-out infinite')+
                '</div>'+
                '<div style="margin-top:8px;display:flex;gap:6px;">'+
                  'eslecto'.split('').map(function(c,i){
                    return '<span style="display:inline-block;font-weight:900;font-size:2rem;color:#1e3a8a;animation:sp-letter 0.5s ease '+((i*0.12)+0.6)+'s both;">'+c+'</span>';
                  }).join('')+
                '</div>'+
                '<p style="margin:12px 0 0;font-weight:700;color:#3b82f6;font-size:.85rem;letter-spacing:.04em;opacity:0;animation:sp-letter 0.5s ease 1.6s both;">Aprende a leer y escribir</p>';
              document.body.appendChild(sp);
              setTimeout(function(){
                sp.style.animation='sp-fadeout 0.5s ease forwards';
                setTimeout(function(){sp.remove();},550);
              },2800);
            }

            /* ═══ 2. NAV LOADING OVERLAY (para transiciones SPA) ═══ */
            var o=document.createElement('div');
            o.id='nav-loading';
            o.style.cssText='display:none;position:fixed;inset:0;z-index:99999;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);';
            o.innerHTML=
              '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-family:Nunito,\\'Varela Round\\',Comfortaa,sans-serif;">'+
                bookHTML(56,'nl-cover 2.8s ease-in-out infinite','nl-float 2.5s ease-in-out infinite')+
                '<p style="margin:0;font-weight:700;color:#1e3a8a;font-size:.9rem;letter-spacing:.03em;">Cargando\\u2026</p>'+
              '</div>';

            document.body.appendChild(o);

            var timer=null;
            window.__navLoaderShow=function(){
              o.style.display='block';
              document.body.style.overflow='hidden';
              clearTimeout(timer);
              timer=setTimeout(function(){window.__navLoaderHide();},10000);
            };
            window.__navLoaderHide=function(){
              o.style.display='none';
              document.body.style.overflow='';
              clearTimeout(timer);
            };

            window.addEventListener('beforeunload',function(){o.style.display='block';});
            window.addEventListener('pageshow',function(){o.style.display='none';document.body.style.overflow='';});
          })();
        `}} />

        {/* PWA: Service Worker Registration + Pull-to-Refresh mobile */}
        <PWARegister />
        <PullToRefresh />
        <NextIntlClientProvider locale={validLocale} messages={messages}>
          <QueryProvider>
            <NavigationProvider>
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </NavigationProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}