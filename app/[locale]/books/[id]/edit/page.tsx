/**
 * UBICACIÓN: app/[locale]/books/[id]/edit/page.tsx
 * ✅ Usar componente multi-idioma BookFormViewMultilang con bookId
 */

'use client';

import { useParams } from 'next/navigation';
import { BookFormViewMultilang } from "@/src/presentation/features/books/components/BookForm/BookFormViewMultilang";

export default function Page() {
  const params = useParams();
  const bookId = params?.id as string;

  return <BookFormViewMultilang bookId={bookId} />;
}