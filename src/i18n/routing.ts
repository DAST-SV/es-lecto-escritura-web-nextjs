// Importa la utilidad `defineRouting` de `next-intl`, encargada de centralizar
// la definición de locales y configuración de internacionalización en las rutas.
import { defineRouting } from 'next-intl/routing';

// Importa la configuración global de internacionalización de la aplicación.
// Contiene los locales soportados y el locale por defecto definidos en `config.ts`.
import { i18nConfig } from './config';

// Define el objeto `routing`, utilizado como fuente única de verdad para la
// configuración de rutas internacionalizadas en la aplicación.
//
// Este objeto se integra con el middleware (`middleware.ts`) y con componentes
// de navegación (`<Link>`, `useRouter`, etc.) para garantizar consistencia en
// la resolución de locales a nivel de URL y renderizado.
export const routing = defineRouting({
  // Lista de locales soportados (ejemplo: ['en', 'es']).
  // Derivada de la configuración centralizada en `i18nConfig`.
  locales: i18nConfig.locales,

  // Locale por defecto que se aplica cuando no se detecta un locale válido
  // en la URL. También utilizado para redirecciones iniciales.
  defaultLocale: i18nConfig.defaultLocale,
});
