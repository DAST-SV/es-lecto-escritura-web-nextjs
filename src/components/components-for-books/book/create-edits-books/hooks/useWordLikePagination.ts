import { useCallback, useRef, useEffect } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseWordLikePaginationProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  setCurrentPage: (page: number) => void;
  enabled?: boolean;
  maxCharsPerPage?: number;
}

interface UseWordLikePaginationReturn {
  handleTextChange: (newText: string) => void;
  isProcessing: boolean;
}

/**
 * Hook que implementa paginación bidireccional tipo Microsoft Word
 * - Divide páginas automáticamente al escribir
 * - Une páginas automáticamente al borrar
 * - Elimina páginas vacías
 */
export const useWordLikePagination = ({
  pages,
  currentPage,
  setPages,
  setCurrentPage,
  enabled = true,
  maxCharsPerPage = 650
}: UseWordLikePaginationProps): UseWordLikePaginationReturn => {
  
  const isProcessing = useRef(false);
  const processingTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Limpia el texto HTML para contar solo caracteres visibles
   */
  const getTextLength = useCallback((html: string): number => {
    if (!html) return 0;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent?.length || 0;
  }, []);

  /**
   * Divide el contenido en dos partes: visible y overflow
   */
  const splitContent = useCallback((html: string, maxChars: number): { visible: string; overflow: string } => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fullText = temp.textContent || '';
    
    if (fullText.length <= maxChars) {
      return { visible: html, overflow: '' };
    }

    // Buscar un punto de corte inteligente (espacio, punto, etc.)
    let cutPoint = maxChars;
    const nearbySpace = fullText.lastIndexOf(' ', maxChars);
    const nearbyPeriod = fullText.lastIndexOf('.', maxChars);
    const nearbyComma = fullText.lastIndexOf(',', maxChars);
    
    const candidates = [nearbySpace, nearbyPeriod, nearbyComma].filter(i => i > maxChars * 0.8);
    if (candidates.length > 0) {
      cutPoint = Math.max(...candidates) + 1;
    }

    const visibleText = fullText.substring(0, cutPoint);
    const overflowText = fullText.substring(cutPoint);

    return {
      visible: `<p>${visibleText}</p>`,
      overflow: overflowText ? `<p>${overflowText}</p>` : ''
    };
  }, []);

  /**
   * Procesa el overflow: crea páginas o elimina vacías
   */
  const processOverflow = useCallback((startPage: number) => {
    if (isProcessing.current || !enabled) return;
    
    isProcessing.current = true;

    setPages(prevPages => {
      let newPages = [...prevPages];
      let modified = false;

      // Procesar desde la página actual hasta el final
      for (let i = startPage; i < newPages.length; i++) {
        const currentPageText = newPages[i].text || '';
        const currentLength = getTextLength(currentPageText);

        // CASO 1: Página con overflow (texto excede el límite)
        if (currentLength > maxCharsPerPage) {
          modified = true;
          const { visible, overflow } = splitContent(currentPageText, maxCharsPerPage);
          
          // Actualizar página actual con contenido visible
          newPages[i] = {
            ...newPages[i],
            text: visible
          };

          // Si hay página siguiente, agregar overflow al inicio
          if (i + 1 < newPages.length) {
            const nextPageText = newPages[i + 1].text || '';
            newPages[i + 1] = {
              ...newPages[i + 1],
              text: overflow + nextPageText
            };
          } else {
            // No hay página siguiente, crear una nueva
            const newPage: page = {
              id: `page-${Date.now()}-${i + 1}`,
              layout: newPages[i].layout || 'TextCenterLayout',
              title: '',
              text: overflow,
              image: null,
              background: newPages[i].background || null,
            };
            newPages.splice(i + 1, 0, newPage);
          }

          // Continuar procesando la siguiente página por si también tiene overflow
          continue;
        }

        // CASO 2: Página con espacio disponible (puede recibir contenido)
        if (currentLength < maxCharsPerPage && i + 1 < newPages.length) {
          const nextPageText = newPages[i + 1].text || '';
          const nextLength = getTextLength(nextPageText);
          const availableSpace = maxCharsPerPage - currentLength;

          // Si el contenido de la siguiente página cabe completamente
          if (nextLength <= availableSpace) {
            modified = true;
            // Traer TODO el contenido de la siguiente página
            newPages[i] = {
              ...newPages[i],
              text: currentPageText + nextPageText
            };

            // Eliminar la página siguiente si queda vacía O si no es la última
            if (i + 2 < newPages.length || nextLength === 0) {
              newPages.splice(i + 1, 1);
              // Volver a procesar esta página por si ahora tiene overflow
              i--;
              continue;
            }
          }
          // Si solo una parte cabe
          else if (availableSpace > 50) { // Mínimo 50 caracteres para justificar el movimiento
            modified = true;
            const { visible, overflow } = splitContent(nextPageText, availableSpace);
            
            // Agregar lo que cabe a la página actual
            newPages[i] = {
              ...newPages[i],
              text: currentPageText + visible
            };

            // Dejar el resto en la siguiente página
            newPages[i + 1] = {
              ...newPages[i + 1],
              text: overflow
            };
          }
        }

        // CASO 3: Página vacía (eliminar si no es la última y no es la página 1)
        if (i > 0 && i < newPages.length - 1 && getTextLength(currentPageText) === 0 && !newPages[i].image) {
          modified = true;
          newPages.splice(i, 1);
          i--; // Ajustar índice después de eliminar
          continue;
        }
      }

      // Asegurar mínimo 2 páginas
      if (newPages.length < 2) {
        newPages.push({
          id: `page-${Date.now()}`,
          layout: 'TextCenterLayout',
          title: '',
          text: '',
          image: null,
          background: null,
        });
      }

      return modified ? newPages : prevPages;
    });

    // Liberar el lock después de un pequeño delay
    setTimeout(() => {
      isProcessing.current = false;
    }, 100);
  }, [enabled, maxCharsPerPage, getTextLength, splitContent, setPages]);

  /**
   * Handler principal para cambios de texto
   */
  const handleTextChange = useCallback((newText: string) => {
    if (!enabled) return;

    // Actualizar el texto inmediatamente
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPage] = {
        ...newPages[currentPage],
        text: newText
      };
      return newPages;
    });

    // Limpiar timeout anterior si existe
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current);
    }

    // Procesar overflow después de un pequeño delay (debounce)
    processingTimeout.current = setTimeout(() => {
      processOverflow(currentPage);
    }, 300);
  }, [enabled, currentPage, setPages, processOverflow]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }
    };
  }, []);

  return {
    handleTextChange,
    isProcessing: isProcessing.current
  };
};