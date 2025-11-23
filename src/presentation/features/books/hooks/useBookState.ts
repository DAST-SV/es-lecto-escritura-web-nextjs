/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookState.ts
 * ACTUALIZADO: Con 3 páginas por defecto (Portada + Reverso + Contenido)
 */

import { useState, useCallback, useEffect } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseBookStateProps {
  initialPages?: page[];
  title?: string;
}

interface UseBookStateReturn {
  pages: page[];
  currentPage: number;
  isFlipping: boolean;
  bookKey: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  setCurrentPage: (page: number) => void;
  setIsFlipping: (flipping: boolean) => void;
  addPage: () => void;
  deletePage: () => void;
  handleLayoutChange: (layout: string) => void;
  handleBackgroundChange: (value: string) => void;
  forceRerender: () => void;
}

// ✅ Función actualizada: 3 páginas por defecto
const createDefaultPages = (title?: string): page[] => [
  { 
    id: 'page-1', 
    layout: 'CoverLayout', 
    title: title || "", 
    text: "", 
    image: null, 
    background: null 
  },
  { 
    id: 'page-2', 
    layout: 'TextCenterLayout', 
    title: "Reverso de Portada", 
    text: "Aquí puedes agregar información adicional o dejar en blanco", 
    image: null, 
    background: null 
  },
];

export const useBookState = ({ initialPages, title }: UseBookStateProps = {}): UseBookStateReturn => {
  const [pages, setPages] = useState<page[]>(() => {
    if (initialPages && initialPages.length > 0) return initialPages;
    return createDefaultPages(title);
  });

  const [currentPage, setCurrentPageState] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [bookKey, setBookKey] = useState(0);

  const setCurrentPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageState(pageIndex);
    }
  }, [pages.length]);

  const forceRerender = useCallback(() => {
    setBookKey(prev => prev + 1);
  }, []);

  // ✅ Agregar SIEMPRE 2 páginas (como libro real)
  const addPage = useCallback(() => {
    const timestamp = Date.now();
    setPages(prev => [
      ...prev,
      // Página impar (frente)
      {
        id: `page-${timestamp}-front`,
        layout: 'TextCenterLayout',
        title: `Página ${prev.length + 1}`,
        text: `Continúa tu historia aquí...`,
        image: null,
        background: null
      },
      // Página par (reverso)
      {
        id: `page-${timestamp}-back`,
        layout: 'TextCenterLayout',
        title: `Página ${prev.length + 2}`,
        text: `Reverso de página ${prev.length + 1}`,
        image: null,
        background: null
      }
    ]);
  }, []);

  // ✅ Validación actualizada: no eliminar primeras 2 páginas
  const deletePage = useCallback(() => {
    // Bloquear si es página 0 (portada) o página 1 (reverso)
    if (currentPage === 0 || currentPage === 1) {
      console.warn('⚠️ No se puede eliminar la portada o el reverso');
      return;
    }

    // Bloquear si quedan 3 páginas o menos
    if (pages.length <= 3) {
      console.warn('⚠️ El libro debe tener al menos 3 páginas');
      return;
    }

    setPages(prev => prev.filter((_, index) => index !== currentPage));
    if (currentPage > 0) setCurrentPage(currentPage - 1);
    forceRerender();
  }, [pages.length, currentPage, setCurrentPage, forceRerender]);

  const handleLayoutChange = useCallback((layout: string) => {
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], layout };
      return updated;
    });
    forceRerender();
  }, [currentPage, forceRerender]);

  const handleBackgroundChange = useCallback((value: string) => {
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], background: value || null };
      return updated;
    });
    setTimeout(() => forceRerender(), 50);
  }, [currentPage, forceRerender]);

  return {
    pages, currentPage, isFlipping, bookKey,
    setPages, setCurrentPage, setIsFlipping,
    addPage, deletePage,
    handleLayoutChange, handleBackgroundChange,
    forceRerender
  };
};