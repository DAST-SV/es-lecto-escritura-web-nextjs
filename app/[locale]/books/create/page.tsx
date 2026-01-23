/**
 * UBICACIÓN: app/[locale]/books/create/page.tsx
 * ✅ Usar componente compartido BookFormView
 */

import { BookFormView } from "@/src/presentation/features/books/components/BookForm/BookFormView";

export default function Page() {
  return <BookFormView />;
}