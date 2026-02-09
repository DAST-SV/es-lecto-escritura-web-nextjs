/**
 * UBICACION: app/[locale]/books/page.tsx
 * Redirige a Mi Mundo (tab escritor) - toda la gestion de libros esta en /my-world
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function BooksRedirectPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/my-world`);
  }, [router, locale]);

  return null;
}
