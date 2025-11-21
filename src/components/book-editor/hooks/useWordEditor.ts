'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';

// Importar extensiones personalizadas
import { FontSize, LineHeight, FontFamily } from '../extensions/tiptap-extensions-complete';

interface Page {
  id: string;
  content: string; // HTML del editor
  image?: string | null;
  background?: string | null;
}

interface UseWordEditorProps {
  initialPages?: Page[];
  maxCharsPerPage?: number;
  onPagesChange?: (pages: Page[]) => void;
}

interface UseWordEditorReturn {
  editor: any;
  pages: Page[];
  currentPage: number;
  totalPages: number;
  isProcessing: boolean;
  
  // Navegación
  goToPage: (pageIndex: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Gestión de páginas
  addPage: () => void;
  deletePage: (pageIndex: number) => void;
  
  // Imágenes y fondos
  addImage: (pageIndex: number, imageUrl: string) => void;
  removeImage: (pageIndex: number) => void;
  setBackground: (pageIndex: number, background: string) => void;
  
  // Estadísticas
  getPageStats: (pageIndex: number) => { chars: number; words: number; lines: number };
  
  // Exportar
  exportToFlipBook: () => any[];
}

export const useWordEditor = ({
  initialPages = [],
  maxCharsPerPage = 650,
  onPagesChange
}: UseWordEditorProps): UseWordEditorReturn => {
  
  // Estado de páginas
  const [pages, setPages] = useState<Page[]>(() => {
    if (initialPages.length > 0) return initialPages;
    
    return [{
      id: `page-${Date.now()}`,
      content: '<p></p>',
      image: null,
      background: null
    }];
  });
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Editor TipTap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      ImageExtension.configure({
        inline: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      FontSize,
      LineHeight.configure({
        types: ['paragraph', 'heading'],
        defaultLineHeight: '1.5',
      }),
    ],
    content: pages[currentPage]?.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'word-editor-content prose prose-sm sm:prose lg:prose-lg focus:outline-none',
        style: 'min-height: 100%; padding: 1rem;'
      },
    },
    onUpdate: ({ editor }) => {
      handleContentChange(editor.getHTML());
    },
  });
  
  // Sincronizar contenido cuando cambia la página actual
  useEffect(() => {
    if (editor && pages[currentPage]) {
      const currentContent = pages[currentPage].content;
      if (editor.getHTML() !== currentContent) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [currentPage, editor]);
  
  // Notificar cambios externos
  useEffect(() => {
    if (onPagesChange) {
      onPagesChange(pages);
    }
  }, [pages, onPagesChange]);
  
  /**
   * Cuenta caracteres de texto plano desde HTML
   */
  const countChars = useCallback((html: string): number => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return (temp.textContent || '').length;
  }, []);
  
  /**
   * Divide contenido HTML en dos partes: visible y overflow
   */
  const splitContent = useCallback((html: string, maxChars: number): { visible: string; overflow: string } => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fullText = temp.textContent || '';
    
    if (fullText.length <= maxChars) {
      return { visible: html, overflow: '' };
    }
    
    // Buscar punto de corte inteligente
    let cutPoint = maxChars;
    const nearbySpace = fullText.lastIndexOf(' ', maxChars);
    const nearbyPeriod = fullText.lastIndexOf('.', maxChars);
    
    const candidates = [nearbySpace, nearbyPeriod].filter(i => i > maxChars * 0.8);
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
   * Procesa paginación automática bidireccional
   */
  const processPagination = useCallback(() => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    setPages(prevPages => {
      let newPages = [...prevPages];
      let modified = false;
      
      // Procesar desde la página actual hasta el final
      for (let i = currentPage; i < newPages.length; i++) {
        const pageContent = newPages[i].content;
        const chars = countChars(pageContent);
        
        // CASO 1: Overflow - contenido excede el límite
        if (chars > maxCharsPerPage) {
          modified = true;
          const { visible, overflow } = splitContent(pageContent, maxCharsPerPage);
          
          newPages[i] = { ...newPages[i], content: visible };
          
          if (i + 1 < newPages.length) {
            // Agregar overflow al inicio de la siguiente página
            const nextContent = newPages[i + 1].content;
            newPages[i + 1] = {
              ...newPages[i + 1],
              content: overflow + nextContent
            };
          } else {
            // Crear nueva página
            newPages.push({
              id: `page-${Date.now()}-${i + 1}`,
              content: overflow,
              image: null,
              background: newPages[i].background || null
            });
          }
          continue;
        }
        
        // CASO 2: Espacio disponible - puede recibir contenido
        if (chars < maxCharsPerPage && i + 1 < newPages.length) {
          const nextContent = newPages[i + 1].content;
          const nextChars = countChars(nextContent);
          const available = maxCharsPerPage - chars;
          
          // Si la siguiente página cabe completa
          if (nextChars <= available) {
            modified = true;
            newPages[i] = {
              ...newPages[i],
              content: pageContent + nextContent
            };
            
            // Eliminar página siguiente si es apropiado
            if (i + 2 < newPages.length || nextChars === 0) {
              newPages.splice(i + 1, 1);
              i--;
              continue;
            }
          }
          // Si solo una parte cabe
          else if (available > 50) {
            modified = true;
            const { visible, overflow } = splitContent(nextContent, available);
            
            newPages[i] = {
              ...newPages[i],
              content: pageContent + visible
            };
            
            newPages[i + 1] = {
              ...newPages[i + 1],
              content: overflow
            };
          }
        }
        
        // CASO 3: Página vacía - eliminar si no es la última
        if (i > 0 && i < newPages.length - 1 && countChars(pageContent) === 0) {
          modified = true;
          newPages.splice(i, 1);
          i--;
          continue;
        }
      }
      
      // Mantener mínimo 1 página
      if (newPages.length === 0) {
        newPages = [{
          id: `page-${Date.now()}`,
          content: '<p></p>',
          image: null,
          background: null
        }];
      }
      
      return modified ? newPages : prevPages;
    });
    
    setTimeout(() => setIsProcessing(false), 100);
  }, [currentPage, maxCharsPerPage, countChars, splitContent, isProcessing]);
  
  /**
   * Handler de cambio de contenido con debounce
   */
  const handleContentChange = useCallback((newContent: string) => {
    // Actualizar inmediatamente
    setPages(prev => {
      const updated = [...prev];
      updated[currentPage] = { ...updated[currentPage], content: newContent };
      return updated;
    });
    
    // Procesar paginación con debounce
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current);
    }
    
    processingTimeout.current = setTimeout(() => {
      processPagination();
    }, 300);
  }, [currentPage, processPagination]);
  
  /**
   * Navegación entre páginas
   */
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  }, [pages.length]);
  
  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, pages.length, goToPage]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);
  
  /**
   * Gestión de páginas
   */
  const addPage = useCallback(() => {
    setPages(prev => [...prev, {
      id: `page-${Date.now()}`,
      content: '<p></p>',
      image: null,
      background: null
    }]);
  }, []);
  
  const deletePage = useCallback((pageIndex: number) => {
    if (pages.length > 1 && pageIndex >= 0 && pageIndex < pages.length) {
      setPages(prev => prev.filter((_, i) => i !== pageIndex));
      
      if (currentPage >= pageIndex && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
  }, [pages.length, currentPage]);
  
  /**
   * Gestión de imágenes
   */
  const addImage = useCallback((pageIndex: number, imageUrl: string) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { ...updated[pageIndex], image: imageUrl };
      }
      return updated;
    });
  }, []);
  
  const removeImage = useCallback((pageIndex: number) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { ...updated[pageIndex], image: null };
      }
      return updated;
    });
  }, []);
  
  /**
   * Gestión de fondos
   */
  const setBackground = useCallback((pageIndex: number, background: string) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { ...updated[pageIndex], background };
      }
      return updated;
    });
  }, []);
  
  /**
   * Estadísticas de página
   */
  const getPageStats = useCallback((pageIndex: number) => {
    const page = pages[pageIndex];
    if (!page) return { chars: 0, words: 0, lines: 0 };
    
    const temp = document.createElement('div');
    temp.innerHTML = page.content;
    const text = temp.textContent || '';
    
    return {
      chars: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length
    };
  }, [pages]);
  
  /**
   * Exportar al formato FlipBook
   */
  const exportToFlipBook = useCallback(() => {
    return pages.map((page, index) => ({
      layout: 'TextCenterLayout',
      title: '',
      text: page.content,
      image: page.image,
      background: page.background,
      id: page.id
    }));
  }, [pages]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }
    };
  }, []);
  
  return {
    editor,
    pages,
    currentPage,
    totalPages: pages.length,
    isProcessing,
    goToPage,
    nextPage,
    prevPage,
    addPage,
    deletePage,
    addImage,
    removeImage,
    setBackground,
    getPageStats,
    exportToFlipBook
  };
};