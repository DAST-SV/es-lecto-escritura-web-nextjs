// Importa la función `defineRouting` de la librería `next-intl`.
// Esta utilidad permite centralizar la definición de rutas internacionalizadas,
// asociando cada ruta base de la app con sus equivalentes en diferentes idiomas.
import { defineRouting } from 'next-intl/routing';

// Importa la configuración de internacionalización definida en `config.ts`.
// Allí se encuentran los idiomas soportados (`locales`) y el idioma por defecto (`defaultLocale`).
import { i18nConfig } from './config';

// Exporta un objeto `routing` que será utilizado en toda la aplicación.
// Este objeto contiene la configuración de enrutamiento multilenguaje,
// asegurando que tanto el middleware, como los componentes de navegación y
// helpers de `next-intl` utilicen una única fuente de verdad.
export const routing = defineRouting({
  // Lista de idiomas soportados en la aplicación.
  // Se obtiene directamente de la configuración centralizada en `i18nConfig`.
  locales: i18nConfig.locales,

  // Idioma por defecto que se aplicará en caso de que el usuario
  // acceda a la app sin un prefijo de idioma en la URL.
  defaultLocale: i18nConfig.defaultLocale,

  // Definición de rutas internacionalizadas (pathnames).
  // Cada clave corresponde a una "ruta base" del sistema (ej: '/auth/login').
  // Para cada ruta, se especifica cómo debe traducirse en cada idioma soportado.
  pathnames: {
    // Ruta de inicio de sesión
    '/auth/login': {
      en: '/auth/login',      // Versión en inglés
      es: '/auth/ingresar'    // Versión en español
    },
    // Ruta de registro de usuario
    '/auth/register': {
      en: '/auth/register',   // Versión en inglés
      es: '/auth/registro'    // Versión en español
    },
    '/pages-my-books': {
      en: '/my-books',
      es: '/mis-libros'
    },
    '/pages-create-book':{
      en: '/create-book',
      es: '/crear-libro'
    }
  }
});
