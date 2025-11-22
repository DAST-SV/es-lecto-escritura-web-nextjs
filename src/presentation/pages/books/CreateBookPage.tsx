/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * 
 * Página de creación de libro
 */

'use client';

import { BookEditor } from "../../features/books/components/BookEditor/BookEditor";


export function CreateBookPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Libro</h1>
      <BookEditor />
    </div>
  );
}