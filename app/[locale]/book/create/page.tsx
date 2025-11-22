// app/[locale]/book/create/page.tsx

import CreateBookPageWrapper from "@/src/components/book-editor/components/CreateBookPageWrapper";

export default function CreateBookPage() {
  return (
    <CreateBookPageWrapper
      bookTitle="Mi Nuevo Libro"
      initialPages={[]}
    />
  );
}