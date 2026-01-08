// Importación de dependencias necesarias
import { NextIntlClientProvider } from 'next-intl'; // Proveedor para la internacionalización
import { routing } from '@/src/i18n/routing'; // Rutas de localización definidas en la aplicación
import { notFound } from 'next/navigation'; // Función para redirigir a una página 404
import { getTranslations, setRequestLocale } from 'next-intl/server'; // Funciones para obtener traducciones y establecer el locale
import { Metadata } from 'next'; // Tipo para la metadata de la página
import { ReactNode, Suspense } from 'react'; // Componentes de React para manejar la carga y los hijos
import "../globals.css"; // Estilos globales de la aplicación
import NavBar from '@/src/components/nav/NavBar'; // Barra de navegación de la aplicación
import Loading from './loading';

// Definición de las propiedades que recibe el layout
interface LayoutProps {
  children: ReactNode; // Contenido hijo que se renderizará dentro del layout
  params: Promise<{ locale: string }>; // Parámetros de la ruta, incluyendo el locale
}

// Función para generar los parámetros estáticos para la generación de rutas
export function generateStaticParams() {
  // Devuelve un arreglo de objetos con los locales disponibles
  return routing.locales.map((locale) => ({ locale }));
}

// Función para generar la metadata dinámica de la página según el locale
export async function generateMetadata({
  params
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;

  // Validación del locale: si no es válido, se retorna una metadata de error
  if (!routing.locales.includes(locale as any)) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  // Obtención de las traducciones para el layout según el locale
  const t = await getTranslations({ locale, namespace: 'layout' });

  // Retorno de la metadata con título y descripción traducidos
  return {
    title: t('meta.title'),
    description: t('meta.description')
  };
}

// Componente principal del layout que envuelve el contenido de la aplicación
export default async function RootLayout({
  children,
  params
}: LayoutProps) {
  const { locale } = await params;

  // Validación del locale: si no es válido, se redirige a la página 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Asignación del locale válido para la solicitud actual
  const validLocale = locale as 'en' | 'es';

  // Establecimiento del locale para la solicitud actual
  setRequestLocale(validLocale);

  // Renderizado del layout con el proveedor de internacionalización y el contenido
  return (
    <html lang={validLocale} className="bg-gray-100">
      <head>
        {/* Enlace a las fuentes de Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Itim&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Nunito:wght@400;700&family=Oswald:wght@400;700&family=Ubuntu:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=PT+Sans:wght@400;700&family=Indie+Flower&family=Cabin:wght@400;700&family=Fira+Sans:wght@400;700&family=Comfortaa:wght@400;700&family=Varela+Round&family=Work+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Proveedor de internacionalización que envuelve el contenido */}
        <NextIntlClientProvider>
          {/* Suspense para manejar la carga de los datos */}
          <Suspense fallback={<Loading />}>
            {/* Contenido principal de la página */}
              {children}
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
