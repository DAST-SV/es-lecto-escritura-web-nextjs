/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ CORREGIDO: Sin UnifiedLayout, fullscreen con navbar flotante
 */

'use client';

import { BookEditor } from "../../features/books/components/BookEditor/BookEditor";
import NavBar from "@/src/components/nav/NavBar";

export function CreateBookPage() {
  return (
    <>
      {/* Navbar flotante */}
      <NavBar />
      
      {/* Editor fullscreen debajo del navbar */}
      <div 
        className="fixed inset-0 bg-white"
        style={{ 
          paddingTop: '60px', // Espacio para el navbar
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <BookEditor />
      </div>
    </>
  );
}

// ✅ TAMBIÉN exportar como default
export default CreateBookPage;