/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookState.ts
 * ✅ CORREGIDO: Usar Page (uppercase) en vez de page (lowercase)
 */

import { useState, useCallback } from 'react';
import { Page } from '@/src/core/domain/types'; // ✅ Import correcto

interface UseBookStateProps {
  initialPages?: Page[];
  title?: string;
}

export const useBookState = ({ initialPages, title }: UseBookStateProps = {}) => {
  const [bookKey, setBookKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const [pages, setPages] = useState<Page[]>( // ✅ Tipo correcto
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

  // Agregar páginas de 2 en 2
  const addPage = useCallback(() => {
    setPages((prev) => {
      const nextId = (prev.length + 1).toString();
      const nextId2 = (prev.length + 2).toString();
      
      return [
        ...prev,
        {
          id: nextId,
          layout: 'TextCenterLayout',
          title: '',
          text: '',
          image: null,
          background: 'blanco',
        },
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

  // Eliminar páginas de 2 en 2
  const deletePage = useCallback(() => {
    setPages((prev) => {
      if (prev.length <= 2) return prev;
      return prev.slice(0, -2);
    });
    
    setCurrentPage((curr) => {
      const newLength = pages.length - 2;
      const maxPage = Math.max(0, newLength - 1);
      return Math.min(curr, maxPage);
    });
    
    setBookKey((k) => k + 1);
  }, [pages.length]);

  // Cambiar layout
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

  // Cambiar fondo
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
    setBookKey,
    addPage,
    deletePage,
    handleLayoutChange,
    handleBackgroundChange,
  };
};