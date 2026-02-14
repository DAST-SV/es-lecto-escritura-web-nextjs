// ============================================
// src/presentation/components/LocaleLink.tsx
// Link inteligente que traduce rutas desde route_translations
// y agrega el locale automáticamente
// ============================================

'use client';

import { ReactNode, useMemo, forwardRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouteTranslations } from '@/src/presentation/hooks/useRouteTranslations';
import { resolveLocalizedHref } from '@/src/infrastructure/utils/resolve-localized-href';

interface LocaleLinkProps {
  /** Ruta física / clave de ruta (ej. "/library") */
  routeKey: string;
  /** Segmentos dinámicos después de la ruta base (ej. "cuentos/mi-libro") */
  dynamicPath?: string;
  /** Override del locale (por defecto usa el locale actual) */
  locale?: string;
  /** Clase CSS */
  className?: string;
  /** Contenido del link */
  children: ReactNode;
  /** Atributo title */
  title?: string;
  /** Prefetch behavior */
  prefetch?: boolean;
  /** Replace history entry instead of push */
  replace?: boolean;
  /** Scroll to top on navigation */
  scroll?: boolean;
}

/**
 * LocaleLink — Link que resuelve rutas traducidas automáticamente.
 *
 * @example Simple
 * ```tsx
 * <LocaleLink routeKey="/library">Biblioteca</LocaleLink>
 * // → <a href="/es/biblioteca">Biblioteca</a>
 * ```
 *
 * @example Con segmentos dinámicos
 * ```tsx
 * <LocaleLink routeKey="/library" dynamicPath={`${category}/${book.slug}`}>
 *   {book.title}
 * </LocaleLink>
 * // → <a href="/es/biblioteca/cuentos/mi-libro">Mi Libro</a>
 * ```
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  function LocaleLink(
    {
      routeKey,
      dynamicPath,
      locale: localeProp,
      className,
      children,
      title,
      prefetch,
      replace,
      scroll,
    },
    ref
  ) {
    const currentLocale = useLocale();
    const locale = localeProp || currentLocale;
    const { data: translationsMap } = useRouteTranslations();

    const href = useMemo(() => {
      if (!translationsMap) {
        // Fallback: usar ruta física hasta que las traducciones carguen
        const suffix = dynamicPath ? `/${dynamicPath.replace(/^\//, '')}` : '';
        return `/${locale}${routeKey}${suffix}`;
      }
      return resolveLocalizedHref(routeKey, locale, translationsMap, dynamicPath);
    }, [routeKey, locale, translationsMap, dynamicPath]);

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        title={title}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
      >
        {children}
      </Link>
    );
  }
);
