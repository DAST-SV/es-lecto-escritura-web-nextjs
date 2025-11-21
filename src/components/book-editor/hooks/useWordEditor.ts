'use client';

import { useCallback, useState, useEffect } from 'react';
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
  content: string;
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
  
  // Navegación
  goToPage: (pageIndex: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Gestión de páginas
  addPage: () => void;
  addSheet: () => void; // ⭐ NUEVO: Agregar hoja completa (2 páginas)
  deletePage: (pageIndex: number) => void;
  deleteSheet: (sheetIndex: number) => void; // ⭐ NUEVO: Eliminar hoja completa
  
  // Imágenes y fondos
  addImage: (pageIndex: number, imageUrl: string) => void;
  removeImage: (pageIndex: number) => void;
  setBackground: (pageIndex: number, background: string) => void;
  
  // Exportar
  exportToFlipBook: () => any[];
  
  // Info de páginas
  getCurrentSheet: () => number;
  getTotalSheets: () => number;
  isFirstPage: () => boolean;
  isLastPage: () => boolean;
  getPageSide: () => 'front' | 'back';
}

export const useWordEditor = ({
  initialPages = [],
  onPagesChange
}: UseWordEditorProps): UseWordEditorReturn => {
  
  // ============================================================
  // ESTADO DE PÁGINAS - SIEMPRE EN PARES (múltiplos de 2)
  // ============================================================
  const [pages, setPages] = useState<Page[]>(() => {
    if (initialPages.length > 0) {
      const normalized = initialPages.map(page => ({
        id: page.id || `page-${Date.now()}-${Math.random()}`,
        content: page.content || '<p></p>',
        image: page.image || null,
        background: page.background || null
      }));
      
      // Asegurar que siempre sea par (mínimo 2 páginas: portada frente/reverso)
      if (normalized.length % 2 !== 0) {
        normalized.push({
          id: `page-${Date.now()}-${Math.random()}`,
          content: '<p></p>',
          image: null,
          background: null
        });
      }
      
      return normalized.length >= 2 ? normalized : [
        {
          id: `page-${Date.now()}-1`,
          content: '<p></p>',
          image: null,
          background: null
        },
        {
          id: `page-${Date.now()}-2`,
          content: '<p></p>',
          image: null,
          background: null
        }
      ];
    }
    
    // Libro nuevo: mínimo 2 páginas (portada frente y reverso)
    return [
      {
        id: `page-${Date.now()}-1`,
        content: '<p></p>',
        image: null,
        background: null
      },
      {
        id: `page-${Date.now()}-2`,
        content: '<p></p>',
        image: null,
        background: null
      }
    ];
  });
  
  const [currentPage, setCurrentPage] = useState(0);
  
  // ============================================================
  // EDITOR TIPTAP
  // ============================================================
  const editor = useEditor({
    immediatelyRender: false,
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
      // Actualizar SOLO el contenido de la página actual
      setPages(prev => {
        const updated = [...prev];
        if (updated[currentPage]) {
          updated[currentPage] = {
            ...updated[currentPage],
            content: editor.getHTML()
          };
        }
        return updated;
      });
    },
  });
  
  // Sincronizar contenido cuando cambia la página actual
  useEffect(() => {
    if (editor && pages[currentPage]) {
      const currentContent = pages[currentPage].content;
      const editorContent = editor.getHTML();
      
      if (editorContent !== currentContent) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [currentPage, editor, pages]);
  
  // Notificar cambios externos
  useEffect(() => {
    if (onPagesChange) {
      onPagesChange(pages);
    }
  }, [pages, onPagesChange]);
  
  // ============================================================
  // FUNCIONES AUXILIARES - INFO DE PÁGINAS
  // ============================================================
  
  const getCurrentSheet = useCallback(() => {
    return Math.floor(currentPage / 2) + 1;
  }, [currentPage]);
  
  const getTotalSheets = useCallback(() => {
    return Math.floor(pages.length / 2);
  }, [pages.length]);
  
  const isFirstPage = useCallback(() => {
    return currentPage === 0;
  }, [currentPage]);
  
  const isLastPage = useCallback(() => {
    return currentPage === pages.length - 1;
  }, [currentPage, pages.length]);
  
  const getPageSide = useCallback((): 'front' | 'back' => {
    return currentPage % 2 === 0 ? 'front' : 'back';
  }, [currentPage]);
  
  // ============================================================
  // NAVEGACIÓN ENTRE PÁGINAS
  // ============================================================
  
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  }, [pages.length]);
  
  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, pages.length]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  // ============================================================
  // GESTIÓN DE PÁGINAS - MODO LIBRO REAL
  // ============================================================
  
  /**
   * Agregar una página individual (manteniendo pares)
   * Si agregamos una página impar, automáticamente se agrega otra
   */
  const addPage = useCallback(() => {
    const timestamp = Date.now();
    const newPages: Page[] = [
      {
        id: `page-${timestamp}-${Math.random()}`,
        content: '<p></p>',
        image: null,
        background: null
      }
    ];
    
    // Si el total quedaría impar, agregar otra página automáticamente
    if ((pages.length + 1) % 2 !== 0) {
      newPages.push({
        id: `page-${timestamp}-${Math.random()}-2`,
        content: '<p></p>',
        image: null,
        background: null
      });
    }
    
    setPages(prev => [...prev, ...newPages]);
    
    // Ir a la primera página nueva
    setTimeout(() => {
      setCurrentPage(pages.length);
    }, 0);
  }, [pages.length]);
  
  /**
   * ⭐ NUEVO: Agregar hoja completa (2 páginas: frente y reverso)
   */
  const addSheet = useCallback(() => {
    const timestamp = Date.now();
    const newSheet: Page[] = [
      // Frente de la hoja
      {
        id: `page-${timestamp}-front`,
        content: '<p></p>',
        image: null,
        background: null
      },
      // Reverso de la hoja
      {
        id: `page-${timestamp}-back`,
        content: '<p></p>',
        image: null,
        background: null
      }
    ];
    
    setPages(prev => [...prev, ...newSheet]);
    
    // Ir al frente de la nueva hoja
    setTimeout(() => {
      setCurrentPage(pages.length);
    }, 0);
  }, [pages.length]);
  
  /**
   * Eliminar una página (manteniendo pares)
   * Si eliminamos una página, también eliminamos su par
   */
  const deletePage = useCallback((pageIndex: number) => {
    // NO permitir eliminar si solo hay 2 páginas (mínimo del libro)
    if (pages.length <= 2) {
      alert('⚠️ No puedes eliminar más páginas. Un libro debe tener al menos 2 páginas (portada frente y reverso).');
      return;
    }
    
    if (pageIndex < 0 || pageIndex >= pages.length) return;
    
    // Determinar cuál es la página par que se debe eliminar también
    const sheetIndex = Math.floor(pageIndex / 2);
    const firstPageOfSheet = sheetIndex * 2;
    
    // Confirmar eliminación de la hoja completa
    const sheetNumber = sheetIndex + 1;
    if (!confirm(`¿Eliminar la hoja ${sheetNumber} completa (frente y reverso)?`)) {
      return;
    }
    
    // Eliminar ambas páginas de la hoja
    setPages(prev => {
      const updated = [...prev];
      updated.splice(firstPageOfSheet, 2); // Eliminar 2 páginas
      return updated;
    });
    
    // Ajustar página actual
    if (currentPage >= firstPageOfSheet) {
      setCurrentPage(Math.max(0, firstPageOfSheet - 1));
    }
  }, [pages.length, currentPage]);
  
  /**
   * ⭐ NUEVO: Eliminar hoja completa (frente y reverso)
   */
  const deleteSheet = useCallback((sheetIndex: number) => {
    const totalSheets = Math.floor(pages.length / 2);
    
    // NO permitir eliminar si solo hay 1 hoja
    if (totalSheets <= 1) {
      alert('⚠️ No puedes eliminar la única hoja del libro.');
      return;
    }
    
    if (sheetIndex < 0 || sheetIndex >= totalSheets) return;
    
    const sheetNumber = sheetIndex + 1;
    if (!confirm(`¿Eliminar la hoja ${sheetNumber} completa (frente y reverso)?`)) {
      return;
    }
    
    const firstPageOfSheet = sheetIndex * 2;
    
    setPages(prev => {
      const updated = [...prev];
      updated.splice(firstPageOfSheet, 2);
      return updated;
    });
    
    // Ajustar página actual
    if (currentPage >= firstPageOfSheet) {
      setCurrentPage(Math.max(0, firstPageOfSheet - 1));
    }
  }, [pages.length, currentPage]);
  
  // ============================================================
  // GESTIÓN DE IMÁGENES Y FONDOS
  // ============================================================
  
  const addImage = useCallback((pageIndex: number, imageUrl: string) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { 
          ...updated[pageIndex], 
          image: imageUrl 
        };
      }
      return updated;
    });
  }, []);
  
  const removeImage = useCallback((pageIndex: number) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { 
          ...updated[pageIndex], 
          image: null 
        };
      }
      return updated;
    });
  }, []);
  
  const setBackground = useCallback((pageIndex: number, background: string) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { 
          ...updated[pageIndex], 
          background: background || null 
        };
      }
      return updated;
    });
  }, []);
  
  // ============================================================
  // EXPORTAR
  // ============================================================
  
  const exportToFlipBook = useCallback(() => {
    return pages.map((page) => ({
      layout: 'TextCenterLayout',
      title: '',
      text: page.content || '',
      image: page.image || null,
      background: page.background || null,
      id: page.id
    }));
  }, [pages]);
  
  return {
    editor,
    pages,
    currentPage,
    totalPages: pages.length,
    goToPage,
    nextPage,
    prevPage,
    addPage,
    addSheet,
    deletePage,
    deleteSheet,
    addImage,
    removeImage,
    setBackground,
    exportToFlipBook,
    getCurrentSheet,
    getTotalSheets,
    isFirstPage,
    isLastPage,
    getPageSide
  };
};