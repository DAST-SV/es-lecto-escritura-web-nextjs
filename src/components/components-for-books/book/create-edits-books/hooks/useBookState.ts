import { useState, useCallback, useEffect } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseBookStateProps {
  initialPages?: page[];
  title?: string;
}

interface UseBookStateReturn {
  // Estados principales
  pages: page[];
  currentPage: number;
  isFlipping: boolean;
  bookKey: number;
  
  // Setters principales
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  setCurrentPage: (page: number) => void;
  setIsFlipping: (flipping: boolean) => void;
  
  // Métodos de manipulación de páginas
  addPage: () => void;
  deletePage: () => void;
  
  // Métodos de configuración de página
  handleLayoutChange: (layout: string) => void;
  handleBackgroundChange: (value: string) => void;
  
  // Utilidades
  forceRerender: () => void;
}

// Función para crear páginas por defecto
const createDefaultPages = (title?: string): page[] => [
  {
    id: 'page-1',
    layout: 'CoverLayout',
    title: title || "",
    text: "",
    image: null,
    background: null,
  },
  {
    id: 'page-2',
    layout: 'TextCenterLayout',
    title: "",
    text: "",
    image: null,
    background: null,
  },
    {
    id: 'page-3',
    layout: 'TextCenterLayout',
    title: "",
    text: "",
    image: null,
    background: null,
  },
];

// Función auxiliar para validar y normalizar páginas recibidas
export const validateAndNormalizePage = (inputPage: any, index: number): page => {
  return {
    id: inputPage.id || `page-${index + 1}`,
    layout: inputPage.layout || 'FullpageLayout',
    title: inputPage.title || `Página ${index + 1}`,
    text: inputPage.text || 'Contenido de la página...',
    image: inputPage.image || null,
    file: null, // Los archivos no se pasan como props iniciales
    background: inputPage.background || null,
    backgroundFile: null, // Los archivos de fondo tampoco
  };
};

export const useBookState = ({ 
  initialPages, 
  title 
}: UseBookStateProps = {}): UseBookStateReturn => {

  // Estado inicial usando páginas recibidas o por defecto
  const [pages, setPages] = useState<page[]>(() => {
    if (initialPages && initialPages.length > 0) {
      return initialPages.map(validateAndNormalizePage);
    }
    return createDefaultPages(title);
  });

  const [currentPage, setCurrentPageState] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [bookKey, setBookKey] = useState(0);

  // Wrapper para setCurrentPage con validaciones
  const setCurrentPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageState(pageIndex);
    }
  }, [pages.length]);

  // useEffect para actualizar páginas si cambian las props
  useEffect(() => {
    if (initialPages && initialPages.length > 0) {
      const normalizedPages = initialPages.map(validateAndNormalizePage);
      setPages(normalizedPages);
      setCurrentPageState(0); // Resetear a la primera página
      setBookKey(prev => prev + 1); // Forzar re-render del libro
    }
  }, [initialPages]);

  // Cleanup al desmontar para evitar memory leaks
  useEffect(() => {
    return () => {
      pages.forEach(page => {
        if (page.image && page.image.startsWith('blob:')) {
          URL.revokeObjectURL(page.image);
        }
        if (page.background && typeof page.background === 'string' && page.background.startsWith('blob:')) {
          URL.revokeObjectURL(page.background);
        }
      });
    };
  }, []);

  // Forzar re-render del flipbook
  const forceRerender = useCallback(() => {
    setBookKey(prev => prev + 1);
  }, []);

  // Agregar nueva página
  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    setPages(prev => [...prev, {
      id: newPageId,
      layout: 'TextCenterLayout',
      title: `Página ${prev.length + 1}`,
      text: `Continúa tu historia aquí...`,
      image: null,
      background: null
     }]);
  }, []);

  // Eliminar página actual
  const deletePage = useCallback(() => {
    if (pages.length > 2) {
      setPages(prev => {
        const pageToDelete = prev[currentPage];

        // Liberar URLs de blob antes de eliminar la página
        if (pageToDelete.image && pageToDelete.image.startsWith('blob:')) {
          URL.revokeObjectURL(pageToDelete.image);
        }
        if (pageToDelete.background && typeof pageToDelete.background === 'string' && pageToDelete.background.startsWith('blob:')) {
          URL.revokeObjectURL(pageToDelete.background);
        }

        return prev.filter((_, index) => index !== currentPage);
      });

      if (currentPage > 0) setCurrentPage(currentPage - 1);
      forceRerender();
    }
  }, [pages.length, currentPage, setCurrentPage, forceRerender]);

  // Handler para cambio de layout
  const handleLayoutChange = useCallback((layout: string) => {
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], layout };
      return updated;
    });
    forceRerender();
  }, [currentPage, forceRerender]);

  // Handler para cambio de fondo
  const handleBackgroundChange = useCallback((value: string) => {
    setPages(prev => {
      const updated = [...prev];
      const currentPageData = updated[currentPage];

      // Liberar URL anterior si existe
      if (currentPageData.background && 
          typeof currentPageData.background === 'string' && 
          currentPageData.background.startsWith('blob:')) {
        URL.revokeObjectURL(currentPageData.background);
      }

      updated[currentPage] = {
        ...currentPageData,
        background: value || null,
        backgroundFile: null // Limpiamos archivo si es color
      };
      return updated;
    });
    setTimeout(() => forceRerender(), 50);
  }, [currentPage, forceRerender]);


  return {
    // Estados principales
    pages,
    currentPage,
    isFlipping,
    bookKey,
    
    // Setters
    setPages,
    setCurrentPage,
    setIsFlipping,
    
    // Métodos de páginas
    addPage,
    deletePage,
    
    // Métodos de configuración
    handleLayoutChange,
    handleBackgroundChange,
    
    // Utilidades
    forceRerender
  };
};