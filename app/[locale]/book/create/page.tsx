/**
 * UBICACIÓN: app/(dashboard)/libros/nuevo/page.tsx
 * 
 * Ruta: /libros/nuevo
 * Responsabilidad: Solo routing - Renderiza el componente de página
 */

import { CreateBookPage } from "@/src/presentation/pages/books/CreateBookPage";


export default function NuevoLibroPage() {
  return <CreateBookPage />;
}