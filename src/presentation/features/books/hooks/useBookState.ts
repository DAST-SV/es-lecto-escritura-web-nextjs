/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookState.ts
 * Hook para manejar el estado del libro - MODIFICADO para agregar páginas de 2 en 2
 */

import { useState, useCallback } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseBookStateProps {
  initialPages?: page[];
  title?: string;
}

export const useBookState = ({ initialPages, title }: UseBookStateProps = {}) => {
  const [bookKey, setBookKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const [pages, setPages] = useState<page[]>(
    initialPages || [
      {
        id: '1',
        layout: 'CoverLayout',
        title: title || '',
        text: '',
        image: null,
        background: 'blanco',
      },
      {
        id: '2',
        layout: 'TextCenterLayout',
        title: '',
        text: '',
        image: null,
        background: 'blanco',
      },
    ]
  );

  // Agregar páginas de 2 en 2 (como un libro real)
  const addPage = useCallback(() => {
    setPages((prev) => {
      const nextId = (prev.length + 1).toString();
      const nextId2 = (prev.length + 2).toString();
      
      return [
        ...prev,
        // Página izquierda (anverso)
        {
          id: nextId,
          layout: 'TextCenterLayout',
          title: '',
          text: '',
          image: null,
          background: 'blanco',
        },
        // Página derecha (reverso)
        {
          id: nextId2,
          layout: 'TextCenterLayout',
          title: '',
          text: '',
          image: null,
          background: 'blanco',
        },
      ];
    });
    setBookKey((k) => k + 1);
  }, []);

  // Eliminar páginas de 2 en 2 (si hay más de 2)
  const deletePage = useCallback(() => {
    setPages((prev) => {
      // No permitir eliminar si solo quedan 2 páginas (portada + contraportada)
      if (prev.length <= 2) return prev;
      
      // Eliminar las últimas 2 páginas
      return prev.slice(0, -2);
    });
    
    // Ajustar la página actual si es necesario
    setCurrentPage((curr) => {
      const newLength = pages.length - 2; // Longitud después de eliminar
      const maxPage = Math.max(0, newLength - 1); // Última página disponible
      return Math.min(curr, maxPage);
    });
    
    setBookKey((k) => k + 1);
  }, [pages.length]);

  // Cambiar layout de página
  const handleLayoutChange = useCallback(
    (layout: string) => {
      setPages((prev) => {
        const updated = [...prev];
        updated[currentPage] = { ...updated[currentPage], layout };
        return updated;
      });
      setBookKey((k) => k + 1);
    },
    [currentPage]
  );

  // Cambiar fondo de página
  const handleBackgroundChange = useCallback(
    (value: string) => {
      setPages((prev) => {
        const updated = [...prev];
        updated[currentPage] = { ...updated[currentPage], background: value };
        return updated;
      });
      setBookKey((k) => k + 1);
    },
    [currentPage]
  );

  return {
    pages,
    setPages,
    currentPage,
    setCurrentPage,
    isFlipping,
    setIsFlipping,
    bookKey,
    addPage,
    deletePage,
    handleLayoutChange,
    handleBackgroundChange,
  };
};