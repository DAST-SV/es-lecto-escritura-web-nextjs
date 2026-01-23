/**
 * UBICACIÓN: app/[locale]/books/[id]/edit/page.tsx
 * ✅ Usar componente compartido BookFormView con bookId
 */

'use client';

import { useParams } from 'next/navigation';
import { BookFormView } from "@/src/presentation/features/books/components/BookForm/BookFormView";

export default function Page() {
  const params = useParams();
  const bookId = params?.id as string;

  return <BookFormView bookId={bookId} />;
}