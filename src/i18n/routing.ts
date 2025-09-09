import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'es'],      // Idiomas soportados
  defaultLocale: 'en',        // Idioma por defecto
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);