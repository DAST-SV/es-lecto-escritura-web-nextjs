/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ CORREGIDO: Sin fullscreen, con altura explícita
 */

'use client';

import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { BookEditor } from "../../features/books/components/BookEditor/BookEditor";

export function CreateBookPage() {
  return (
    <UnifiedLayout>
      {/* ✅ Contenedor con altura calculada para compensar el navbar */}
      <div style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <BookEditor />
      </div>
    </UnifiedLayout>
  );
}