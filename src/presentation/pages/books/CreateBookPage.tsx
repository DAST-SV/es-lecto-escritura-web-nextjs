/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * 
 * Página de creación de libro
 */

'use client';

import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { BookEditor } from "../../features/books/components/BookEditor/BookEditor";


export function CreateBookPage() {
  return (
    <UnifiedLayout className="min-h-screen bg-slate-50" mainClassName="pt-0">
      {/* Hero Carousel - Altura responsiva mejorada */}
      <div className="w-full">
        <div className="relative h-[calc(100vh-60px)] overflow-hidden">
          <BookEditor />
        </div>
      </div>
    </UnifiedLayout>
  );
}