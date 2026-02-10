/**
 * UBICACION: app/[locale]/books/page.tsx
 * Redirige a Mi Mundo (tab escritor) - toda la gestion de libros esta en /my-world
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BooksRedirectPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    router.replace(`/${locale}/my-world`);
  }, [router, locale]);

  return null;
}
